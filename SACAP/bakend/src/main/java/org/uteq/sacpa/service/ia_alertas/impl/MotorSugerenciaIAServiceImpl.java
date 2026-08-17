package org.uteq.sacpa.service.ia_alertas.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_alertas.LoteSugeridoDTO;
import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.entity.ia_alertas.ReglaNegocioIA;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.repository.ia_alertas.IReglaNegocioIARepository;
import org.uteq.sacpa.repository.operaciones.ITemporadaRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.service.ia_alertas.IMotorSugerenciaIAService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Algoritmo determinístico 0-100 pts, sin API de IA externa:
 *   Variable A (urgencia FEFO, 0-70 pts) + Variable B (temporada agrícola activa, 0-30 pts)
 *   Variable C (categoría del producto) es un filtro duro, no un puntaje.
 */
@Service
@RequiredArgsConstructor
public class MotorSugerenciaIAServiceImpl implements IMotorSugerenciaIAService {

    private static final int ID_ESTADO_LOTE_ACTIVO = 1;
    private static final int SCORE_MIN_SUGERENCIA = 15;
    private static final int SCORE_MIN_COMBO = 35;
    private static final BigDecimal DESCUENTO_MAXIMO_DEFECTO = new BigDecimal("35.00");

    private final ILoteRepository loteRepository;
    private final ITemporadaRepository temporadaRepository;
    private final IReglaNegocioIARepository reglaRepository;

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

        List<LoteSugeridoDTO> puntuados = candidatos.stream()
                .map(l -> {
                    Integer idCultivo = null;
                    // Lote -> Producto -> id_categoria podria usarse, pero no tenemos Cultivo en Producto facilmente.
                    // Se asume sugerencia general si no hay cultivo
                    boolean tempActiva = hayTemporadaActiva(null);
                    return puntuarLote(l, tempActiva);
                })
                .sorted(Comparator.comparing(LoteSugeridoDTO::getScoreUrgencia).reversed())
                .toList();

        List<LoteSugeridoDTO> relevantes = puntuados.stream()
                .filter(l -> l.getScoreUrgencia() >= SCORE_MIN_SUGERENCIA)
                .toList();
        if (relevantes.isEmpty()) return List.of();

        List<LoteSugeridoDTO> paraCombo = relevantes.stream()
                .filter(l -> l.getScoreUrgencia() >= SCORE_MIN_COMBO)
                .toList();

        List<SugerenciaComboDTO> resultado = new ArrayList<>();
        if (paraCombo.size() >= 2) {
            int scoreCombo = (int) Math.round(paraCombo.stream().mapToInt(LoteSugeridoDTO::getScoreUrgencia).average().orElse(0));
            BigDecimal descuento = mapearDescuento(scoreCombo, descuentoMaximo);
            resultado.add(SugerenciaComboDTO.builder()
                    .titulo("Combo " + paraCombo.size() + " productos")
                    .esCombo(true)
                    .score(scoreCombo)
                    .descuentoSugerido(descuento)
                    .justificacionIA(construirJustificacionCombo(paraCombo, true, scoreCombo, descuento))
                    .lotes(paraCombo)
                    .build());
            relevantes.stream()
                    .filter(l -> !paraCombo.contains(l))
                    .forEach(l -> resultado.add(individual(l, true, descuentoMaximo)));
        } else {
            relevantes.forEach(l -> resultado.add(individual(l, true, descuentoMaximo)));
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public SugerenciaComboDTO generarSugerenciaParaLote(Lote lote) {
        boolean temporadaActiva = hayTemporadaActiva(null);
        BigDecimal descuentoMaximo = obtenerDescuentoMaximo();
        return individual(puntuarLote(lote, temporadaActiva), temporadaActiva, descuentoMaximo);
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
        if (idCultivo != null && temporadaRepository.findByEstadoAndCultivo_IdCultivo("ACTIVO", idCultivo).isPresent()) {
            return true;
        }
        return temporadaRepository.findByEstadoAndCultivoIsNull("ACTIVO").isPresent();
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
