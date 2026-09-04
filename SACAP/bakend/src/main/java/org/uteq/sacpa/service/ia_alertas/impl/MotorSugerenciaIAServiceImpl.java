package org.uteq.sacpa.service.ia_alertas.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_alertas.LoteSugeridoDTO;
import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.entity.ia_alertas.ReglaNegocioIA;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.repository.ia_alertas.IReglaNegocioIARepository;
import org.uteq.sacpa.repository.ia_alertas.ITemporadaAgricolaRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.service.ia_alertas.IMotorSugerenciaIAService;
import org.uteq.sacpa.service.ia_externa.ProveedorIAFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Score 0-100 pts determinístico (nunca delegado a la IA externa):
 *   Variable A (urgencia FEFO, 0-70 pts) + Variable B (temporada agrícola activa, 0-30 pts)
 *   Variable C (categoría del producto) es un filtro duro, no un puntaje.
 * El proveedor de IA externa activo (Gemini, Groq, ... elegido por el admin en
 * Configuración General, ver {@link ProveedorIAFactory}) solo redacta el texto de la
 * justificación a partir de ese score ya calculado; si falla o no hay key configurada,
 * se usa el texto determinístico de siempre como fallback.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MotorSugerenciaIAServiceImpl implements IMotorSugerenciaIAService {

    private static final int ID_ESTADO_LOTE_ACTIVO = 1;
    private static final int SCORE_MIN_SUGERENCIA = 15;
    private static final int SCORE_MIN_COMBO = 35;
    private static final int MAX_LOTES_POR_COMBO = 3;
    private static final BigDecimal DESCUENTO_MAXIMO_DEFECTO = new BigDecimal("35.00");

    private final ILoteRepository loteRepository;
    private final ITemporadaAgricolaRepository temporadaAgricolaRepository;
    private final IReglaNegocioIARepository reglaRepository;
    private final ProveedorIAFactory proveedorIAFactory;

    @Override
    @Transactional(readOnly = true)
    public List<SugerenciaComboDTO> generarSugerencias(Integer idCategoria) {
        List<Lote> candidatos = loteRepository.findDisponiblesParaVenta(idCategoria, ID_ESTADO_LOTE_ACTIVO);
        return construirSugerencias(candidatos);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SugerenciaComboDTO> generarSugerenciasPorPlaga(Integer idPlaga, Integer idCultivo) {
        List<Lote> candidatos = loteRepository.findDisponiblesParaVentaPorPlaga(idPlaga, idCultivo, ID_ESTADO_LOTE_ACTIVO);
        return construirSugerencias(candidatos);
    }

    private List<SugerenciaComboDTO> construirSugerencias(List<Lote> candidatos) {
        if (candidatos.isEmpty()) return List.of();

        BigDecimal descuentoMaximo = obtenerDescuentoMaximo();
        // Se evalúa UNA sola vez, no una por lote como antes.
        boolean tempActiva = hayTemporadaActiva(null);

        List<LoteSugeridoDTO> puntuados = candidatos.stream()
                .map(l -> puntuarLote(l, tempActiva))
                .sorted(Comparator.comparing(LoteSugeridoDTO::getScoreUrgencia).reversed())
                .toList();

        List<LoteSugeridoDTO> relevantes = puntuados.stream()
                .filter(l -> l.getScoreUrgencia() >= SCORE_MIN_SUGERENCIA)
                .toList();
        if (relevantes.isEmpty()) return List.of();

        List<SugerenciaComboDTO> resultado = new ArrayList<>();
        List<String> prompts = new ArrayList<>();

        // Elegibles para combo, agrupados por categoría. LinkedHashMap preserva
        // el orden de aparición, que ya viene ordenado por score descendente.
        Map<Integer, List<LoteSugeridoDTO>> porCategoria = relevantes.stream()
                .filter(l -> l.getScoreUrgencia() >= SCORE_MIN_COMBO)
                .collect(Collectors.groupingBy(
                        l -> l.getIdCategoria() != null ? l.getIdCategoria() : -1,
                        LinkedHashMap::new,
                        Collectors.toList()));

        Set<Integer> lotesYaEnCombo = new HashSet<>();

        for (List<LoteSugeridoDTO> grupo : porCategoria.values()) {
            // Un solo lote por producto dentro del combo: evita que CarritoService
            // los sume en una línea con cantidad inflada. Se queda el de mayor score.
            List<LoteSugeridoDTO> unicosPorProducto = new ArrayList<>();
            Set<Integer> productosVistos = new HashSet<>();
            for (LoteSugeridoDTO l : grupo) {
                if (l.getIdProducto() == null || productosVistos.add(l.getIdProducto())) {
                    unicosPorProducto.add(l);
                }
            }

            int numeroCombo = 0;
            for (int i = 0; i < unicosPorProducto.size(); i += MAX_LOTES_POR_COMBO) {
                List<LoteSugeridoDTO> bloque = List.copyOf(unicosPorProducto.subList(
                        i, Math.min(i + MAX_LOTES_POR_COMBO, unicosPorProducto.size())));
                // Un solo lote no es combo: cae a sugerencia individual más abajo.
                if (bloque.size() < 2) break;

                numeroCombo++;
                int scoreCombo = (int) Math.round(bloque.stream()
                        .mapToInt(LoteSugeridoDTO::getScoreUrgencia).average().orElse(0));
                BigDecimal descuento = mapearDescuento(scoreCombo, descuentoMaximo);
                String nombreCat = bloque.get(0).getNombreCategoria() != null
                        ? bloque.get(0).getNombreCategoria() : "Varios";
                String titulo = "Combo " + nombreCat + " · " + bloque.size() + " lotes"
                        + (numeroCombo > 1 ? " (" + numeroCombo + ")" : "");

                resultado.add(SugerenciaComboDTO.builder()
                        .titulo(titulo)
                        .esCombo(true)
                        .score(scoreCombo)
                        .descuentoSugerido(descuento)
                        .justificacionIA(construirJustificacionCombo(bloque, tempActiva, scoreCombo, descuento))
                        .lotes(bloque)
                        .build());
                prompts.add(promptCombo(bloque, tempActiva, scoreCombo, descuento));
                bloque.forEach(l -> lotesYaEnCombo.add(l.getIdLote()));
            }
        }

        // Todo lo que no entró en un combo sale como sugerencia individual.
        relevantes.stream()
                .filter(l -> !lotesYaEnCombo.contains(l.getIdLote()))
                .forEach(l -> {
                    resultado.add(individual(l, tempActiva, descuentoMaximo));
                    prompts.add(promptIndividual(l, tempActiva,
                            mapearDescuento(l.getScoreUrgencia(), descuentoMaximo)));
                });

        enriquecerConIA(resultado, prompts);
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public SugerenciaComboDTO generarSugerenciaParaLote(Lote lote) {
        boolean temporadaActiva = hayTemporadaActiva(null);
        BigDecimal descuentoMaximo = obtenerDescuentoMaximo();
        LoteSugeridoDTO l = puntuarLote(lote, temporadaActiva);
        SugerenciaComboDTO dto = individual(l, temporadaActiva, descuentoMaximo);
        enriquecerConIA(List.of(dto), List.of(promptIndividual(l, temporadaActiva, mapearDescuento(l.getScoreUrgencia(), descuentoMaximo))));
        return dto;
    }

    private SugerenciaComboDTO individual(LoteSugeridoDTO l, boolean temporadaActiva, BigDecimal descuentoMaximo) {
        BigDecimal descuento = mapearDescuento(l.getScoreUrgencia(), descuentoMaximo);
        return SugerenciaComboDTO.builder()
                .titulo(l.getNombreProducto())
                .esCombo(false)
                .score(l.getScoreUrgencia())
                .descuentoSugerido(descuento)
                .justificacionIA(construirJustificacionIndividual(l, temporadaActiva, descuento))
                .lotes(List.of(l))
                .build();
    }

    /**
     * Redacta con UNA sola llamada a Gemini las justificaciones de toda la pantalla (no una por lote —
     * el free tier de la API permite pocas solicitudes por día). Si falla o la key no está configurada,
     * los DTOs ya traen el texto determinístico de {@link #construirJustificacionIndividual} /
     * {@link #construirJustificacionCombo} puesto de antemano, así que no hace falta hacer nada más.
     */
    private void enriquecerConIA(List<SugerenciaComboDTO> resultado, List<String> prompts) {
        try {
            List<String> textos = proveedorIAFactory.obtenerActivo().generarJustificaciones(prompts);
            if (textos == null || textos.size() != resultado.size()) {
                throw new IllegalStateException("El proveedor de IA devolvió " + (textos == null ? 0 : textos.size())
                        + " justificaciones, se esperaban " + resultado.size());
            }
            for (int i = 0; i < resultado.size(); i++) {
                String texto = textos.get(i);
                if (texto != null && !texto.isBlank()) {
                    resultado.get(i).setJustificacionIA(texto);
                }
            }
        } catch (Exception e) {
            log.warn("Proveedor de IA no disponible, usando justificaciones determinísticas: {}", e.getMessage());
        }
    }

    private String promptIndividual(LoteSugeridoDTO l, boolean temporadaActiva, BigDecimal descuento) {
        return """
                Eres el asistente de ventas de un sistema agrícola. Redacta en español, en 1-2 frases,
                un mensaje breve y persuasivo (sin emojis) para ofrecerle este producto a un técnico de campo.
                Usa solo estos datos, no inventes nada más:
                - Producto: %s
                - Vence en %d días
                - Descuento sugerido: %s%%
                - Temporada agrícola activa: %s
                """.formatted(
                l.getNombreProducto(),
                l.getDiasHastaVencimiento(),
                descuento.toPlainString(),
                temporadaActiva ? "sí" : "no");
    }

    private String promptCombo(List<LoteSugeridoDTO> lotes, boolean temporadaActiva, int score, BigDecimal descuento) {
        String nombres = lotes.stream().map(LoteSugeridoDTO::getNombreProducto).collect(Collectors.joining(", "));
        return """
                Eres el asistente de ventas de un sistema agrícola. Redacta en español, en 1-2 frases,
                un mensaje breve y persuasivo (sin emojis) para ofrecer este combo a un técnico de campo.
                Usa solo estos datos, no inventes nada más:
                - Productos del combo: %s
                - Descuento sugerido: %s%%
                - Temporada agrícola activa: %s
                """.formatted(nombres, descuento.toPlainString(), temporadaActiva ? "sí" : "no");
    }

    private LoteSugeridoDTO puntuarLote(Lote lote, boolean temporadaActiva) {
        long dias = lote.getFechaVencimiento() != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), lote.getFechaVencimiento())
                : Long.MAX_VALUE;
        int urgencia = puntajeUrgencia(dias);
        int score = Math.min(100, urgencia + (temporadaActiva ? 30 : 0));

        String nombreBodega = "N/D";
        if (lote.getUbicacion() != null && lote.getUbicacion().getEstanteria() != null
                && lote.getUbicacion().getEstanteria().getZona() != null
                && lote.getUbicacion().getEstanteria().getZona().getAlmacen() != null) {
            nombreBodega = lote.getUbicacion().getEstanteria().getZona().getAlmacen().getNombre();
        }

        int disponible = (lote.getCantidadActual() != null ? lote.getCantidadActual() : 0)
                - (lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0);

        return LoteSugeridoDTO.builder()
                .idLote(lote.getIdLote())
                .numeroLote(lote.getNumeroLote())
                .idProducto(lote.getProducto() != null ? lote.getProducto().getIdProducto() : null)
                .nombreProducto(lote.getProducto() != null ? lote.getProducto().getNombre() : null)
                .nombreBodega(nombreBodega)
                .diasHastaVencimiento(dias)
                .cantidadDisponible(disponible)
                .precioUnitario(lote.getProducto() != null ? lote.getProducto().getPrecio() : null)
                .scoreUrgencia(score)
                .instruccionesAplicacion(lote.getProducto() != null ? lote.getProducto().getInstruccionesAplicacion() : null)
                .idCategoria(lote.getProducto() != null && lote.getProducto().getCategoria() != null
                        ? lote.getProducto().getCategoria().getIdCategoria() : null)
                .nombreCategoria(lote.getProducto() != null && lote.getProducto().getCategoria() != null
                        ? lote.getProducto().getCategoria().getNombre() : null)
                .build();
    }

    private int puntajeUrgencia(long dias) {
        if (dias < 0) return 0; // ya venció: no es "urgente vender", es no vendible
        if (dias <= 15) return 70;
        if (dias <= 30) return 55;
        if (dias <= 60) return 35;
        if (dias <= 90) return 15;
        return 0;
    }

    private boolean hayTemporadaActiva(Integer idCultivo) {
        List<TemporadaAgricola> activas = temporadaAgricolaRepository.findActivasEnFecha(LocalDate.now(), 1); // 1 = ACTIVA
        if (activas.isEmpty()) return false;
        if (idCultivo == null) return true;
        return activas.stream()
            .anyMatch(t -> t.getCultivo() != null && t.getCultivo().toLowerCase().contains(idCultivo.toString()));
    }

    private BigDecimal obtenerDescuentoMaximo() {
        return reglaRepository.findByActivoTrue().stream()
                .findFirst()
                .map(ReglaNegocioIA::getDescuentoMaximo)
                .orElse(DESCUENTO_MAXIMO_DEFECTO);
    }

    private BigDecimal mapearDescuento(int score, BigDecimal tope) {
        BigDecimal sugerido;
        if (score >= 80) sugerido = new BigDecimal("25");
        else if (score >= 60) sugerido = new BigDecimal("18");
        else if (score >= 35) sugerido = new BigDecimal("10");
        else if (score >= 15) sugerido = new BigDecimal("5");
        else sugerido = BigDecimal.ZERO;
        return (tope != null && sugerido.compareTo(tope) > 0) ? tope : sugerido;
    }

    private String construirJustificacionIndividual(LoteSugeridoDTO l, boolean temporadaActiva, BigDecimal descuento) {
        StringBuilder sb = new StringBuilder();
        sb.append("Lote ").append(l.getNumeroLote()).append(" vence en ").append(l.getDiasHastaVencimiento())
          .append(" días (urgencia ").append(puntajeUrgencia(l.getDiasHastaVencimiento())).append("/70)");
        if (temporadaActiva) sb.append(" + temporada agrícola activa (+30)");
        sb.append(" → score ").append(l.getScoreUrgencia()).append("/100, descuento sugerido ").append(descuento).append("%.");
        return sb.toString();
    }

    private String construirJustificacionCombo(List<LoteSugeridoDTO> lotes, boolean temporadaActiva, int score, BigDecimal descuento) {
        String nombres = lotes.stream().map(LoteSugeridoDTO::getNombreProducto).collect(Collectors.joining(" + "));
        StringBuilder sb = new StringBuilder("Combo sugerido: ").append(nombres)
                .append(" — ").append(lotes.size()).append(" productos con vencimiento próximo");
        if (temporadaActiva) sb.append(" en temporada agrícola activa");
        sb.append(" → score ").append(score).append("/100, descuento sugerido ").append(descuento).append("%.");
        return sb.toString();
    }
}
