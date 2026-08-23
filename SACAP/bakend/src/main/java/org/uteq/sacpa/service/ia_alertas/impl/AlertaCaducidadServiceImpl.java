package org.uteq.sacpa.service.ia_alertas.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_alertas.AlertaCaducidadResponseDTO;
import org.uteq.sacpa.dto.ia_alertas.AlertaRequestDTO;
import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.uteq.sacpa.entity.catalogos.CatEstadoAlerta;
import org.uteq.sacpa.entity.catalogos.CatEstadoAprobacion;
import org.uteq.sacpa.entity.catalogos.CatEstadoLote;
import org.uteq.sacpa.entity.catalogos.CatEstadoTemporada;
import org.uteq.sacpa.entity.ia_alertas.AlertaCaducidad;
import org.uteq.sacpa.entity.ia_alertas.EjecucionIA;
import org.uteq.sacpa.entity.ia_alertas.ModeloIA;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;
import org.uteq.sacpa.entity.ia_alertas.ReglaNegocioIA;
import org.uteq.sacpa.entity.catalogos.CatNivelAlerta;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.repository.catalogos.ICatEstadoAlertaRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoAprobacionRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoLoteRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoTemporadaRepository;
import org.uteq.sacpa.repository.catalogos.ICatNivelAlertaRepository;
import org.uteq.sacpa.repository.ia_alertas.IAlertaCaducidadRepository;
import org.uteq.sacpa.repository.ia_alertas.IEjecucionIARepository;
import org.uteq.sacpa.repository.ia_alertas.IModeloIARepository;
import org.uteq.sacpa.repository.ia_alertas.ISugerenciaIARepository;
import org.uteq.sacpa.repository.ia_alertas.ITemporadaAgricolaRepository;
import org.uteq.sacpa.repository.ia_alertas.IReglaNegocioIARepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.service.ia_alertas.IAlertaCaducidadService;
import org.uteq.sacpa.service.ia_alertas.IMotorSugerenciaIAService;
import org.uteq.sacpa.service.ia_alertas.IPromocionService;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AlertaCaducidadServiceImpl implements IAlertaCaducidadService {

    private static final String NOMBRE_MODELO_REGLAS = "Motor de Reglas SACPA";
    private static final String VERSION_MODELO_REGLAS = "v1.0";
    private static final Integer ID_ESTADO_LOTE_DISPONIBLE = 1; // cat_estado_lote → ACTIVO/DISPONIBLE (mismo id que usa LoteServiceImpl)

    private final IAlertaCaducidadRepository alertaRepository;
    private final ICatEstadoAlertaRepository catEstadoAlertaRepository;
    private final ICatEstadoLoteRepository catEstadoLoteRepository;
    private final ICatNivelAlertaRepository catNivelAlertaRepository;
    private final IMotorSugerenciaIAService motorSugerenciaIAService;
    private final ITemporadaAgricolaRepository temporadaRepository;
    private final ICatEstadoTemporadaRepository catEstadoTemporadaRepository;
    private final ISugerenciaIARepository sugerenciaRepository;
    private final ICatEstadoAprobacionRepository catEstadoAprobacionRepository;
    private final IModeloIARepository modeloIARepository;
    private final IEjecucionIARepository ejecucionIARepository;
    private final IPromocionService promocionService;
    private final IReglaNegocioIARepository reglaNegocioIARepository;
    private final ILoteRepository loteRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void crearAlerta(AlertaRequestDTO dto) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_alerta_caducidad(?, ?, ?, ?)")) {
                ps.setString(1, dto.getMensaje());
                ps.setInt(2, dto.getIdLote());
                ps.setInt(3, dto.getIdNivelAlerta());
                ps.setInt(4, dto.getIdEstado());
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @Transactional
    public Page<AlertaCaducidadResponseDTO> listarAlertasActivas(Integer idEstadoActivo, Pageable pageable) {
        sincronizarAlertasAutomaticas();
        return alertaRepository.findAlertasActivas(idEstadoActivo, pageable)
                .map(a -> AlertaCaducidadResponseDTO.from(a, sugerenciaDescuentoEstimado(a)));
    }

    /**
     * Detecta lotes DISPONIBLES próximos a vencer (según el umbral configurado en la Regla de
     * Negocio IA) y genera su alerta si todavía no tienen NINGUNA (en cualquier estado). No hay
     * job/scheduler en este proyecto, así que la sincronización corre de forma perezosa cada vez
     * que se listan las alertas — el dataset es pequeño y la operación es idempotente.
     *
     * Importante: se excluye por lote con alerta previa en CUALQUIER estado, no solo ACTIVA — si
     * no, una alerta recién Descartada (o promovida a EN_PROMOCION) se regeneraría en el siguiente
     * GET, contradiciendo la acción que el usuario acaba de tomar.
     *
     * Además: cualquier lote DISPONIBLE cuya fecha de vencimiento ya pasó se mueve automáticamente
     * a CADUCADO — para que deje de aparecer en FEFO/checkout como stock vendible. Esto corre
     * independiente de si el lote ya tenía alerta o no (así también corrige lotes vencidos de
     * antes de este cambio).
     */
    private void sincronizarAlertasAutomaticas() {
        Integer diasAnticipacion = reglaNegocioIARepository.findByActivoTrue().stream()
                .findFirst()
                .map(ReglaNegocioIA::getDiasAlertaAnticipada)
                .orElse(60);

        LocalDate fechaLimite = LocalDate.now().plusDays(diasAnticipacion);
        List<Lote> candidatos = loteRepository.findLotesProximosAVencer(fechaLimite, ID_ESTADO_LOTE_DISPONIBLE);
        if (candidatos.isEmpty()) return;

        Integer idEstadoActiva = catEstadoAlertaRepository.findByNombreIgnoreCase("ACTIVA")
                .map(CatEstadoAlerta::getIdEstadoAlerta)
                .orElseThrow(() -> new IllegalStateException("No existe el estado de alerta ACTIVA en el catálogo"));

        Set<Integer> lotesConAlertaPrevia = new HashSet<>();
        for (AlertaCaducidad a : alertaRepository.findAll()) {
            if (a.getLote() != null) lotesConAlertaPrevia.add(a.getLote().getIdLote());
        }

        for (Lote lote : candidatos) {
            long diasRestantes = ChronoUnit.DAYS.between(LocalDate.now(), lote.getFechaVencimiento());
            boolean yaVencido = diasRestantes < 0;
            boolean movidoACaducado = false;

            if (yaVencido) {
                movidoACaducado = marcarLoteComoCaducado(lote);
            }

            if (lotesConAlertaPrevia.contains(lote.getIdLote())) continue;

            String nombreNivel = diasRestantes <= 15 ? "CRÍTICA" : diasRestantes <= 30 ? "ADVERTENCIA" : "PREVENTIVA";
            Integer idNivel = catNivelAlertaRepository.findByNombreIgnoreCase(nombreNivel)
                    .map(CatNivelAlerta::getIdNivelAlerta)
                    .orElseThrow(() -> new IllegalStateException("No existe el nivel de alerta " + nombreNivel + " en el catálogo"));

            String nombreProducto = lote.getProducto() != null ? lote.getProducto().getNombre() : "producto";
            String mensaje;
            if (yaVencido && movidoACaducado) {
                mensaje = "El lote " + lote.getNumeroLote() + " (" + nombreProducto + ") ya venció y el sistema lo movió automáticamente a CADUCADO (fuera de venta).";
            } else if (yaVencido) {
                mensaje = "El lote " + lote.getNumeroLote() + " (" + nombreProducto + ") ya venció.";
            } else {
                mensaje = "El lote " + lote.getNumeroLote() + " (" + nombreProducto + ") vence en " + diasRestantes + " días.";
            }

            crearAlertaJdbc(mensaje, lote.getIdLote(), idNivel, idEstadoActiva);
        }
    }

    /** Saca del stock vendible un lote DISPONIBLE ya vencido. Devuelve true si hizo la transición. */
    private boolean marcarLoteComoCaducado(Lote lote) {
        if (!ID_ESTADO_LOTE_DISPONIBLE.equals(lote.getIdEstadoLote())) return false;
        Integer idCaducado = catEstadoLoteRepository.findByNombreIgnoreCase("CADUCADO")
                .map(CatEstadoLote::getIdEstadoLote)
                .orElse(null);
        if (idCaducado == null) return false; // catálogo sin ese estado en esta BD — no rompe el flujo, solo no transiciona
        lote.setIdEstadoLote(idCaducado);
        loteRepository.save(lote);
        return true;
    }

    private void crearAlertaJdbc(String mensaje, Integer idLote, Integer idNivelAlerta, Integer idEstado) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_alerta_caducidad(?, ?, ?, ?)")) {
                ps.setString(1, mensaje);
                ps.setInt(2, idLote);
                ps.setInt(3, idNivelAlerta);
                ps.setInt(4, idEstado);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertaCaducidadResponseDTO> buscarPorLote(Integer idLote) {
        return alertaRepository.findByLote_IdLote(idLote).stream()
                .map(a -> AlertaCaducidadResponseDTO.from(a, sugerenciaDescuentoEstimado(a)))
                .toList();
    }

    @Override
    @Transactional
    public void descartarAlerta(Integer idAlerta, Integer idEstadoDescartado) {
        descartarAlertaJdbc(idAlerta, idEstadoDescartado);
    }

    @Override
    @Transactional
    public PromocionResponseDTO promoverAlerta(Integer idAlerta, Integer idUsuarioAprueba) {
        AlertaCaducidad alerta = alertaRepository.findById(idAlerta)
                .orElseThrow(() -> new EntityNotFoundException("Alerta no encontrada: " + idAlerta));
        Lote lote = alerta.getLote();
        if (lote == null) {
            throw new IllegalStateException("La alerta " + idAlerta + " no tiene un lote asociado");
        }

        SugerenciaComboDTO sugerencia = motorSugerenciaIAService.generarSugerenciaParaLote(lote);

        Integer idTemporada = resolverTemporadaParaSugerencia();
        Integer idEjecucion = registrarEjecucionMotor(sugerencia);
        Integer idPendiente = catEstadoAprobacionRepository.findByNombreIgnoreCase("PENDIENTE")
                .map(CatEstadoAprobacion::getIdEstadoAprobacion)
                .orElseThrow(() -> new IllegalStateException("No existe el estado de aprobación PENDIENTE en el catálogo"));

        crearSugerenciaJdbc(sugerencia.getDescuentoSugerido(), sugerencia.getJustificacionIA(),
                lote.getIdLote(), idTemporada, idEjecucion, idPendiente);
        SugerenciaIA sugerenciaCreada = sugerenciaRepository.findTopByOrderByIdSugerenciaDesc();

        LocalDate fechaInicio = LocalDate.now();
        // El lote puede estar ya vencido (motivo típico de una alerta CRÍTICA); la promoción de
        // liquidación siempre necesita una ventana válida hacia adelante, sin importar la fecha del lote.
        LocalDate fechaFin = lote.getFechaVencimiento() != null && lote.getFechaVencimiento().isAfter(fechaInicio)
                ? lote.getFechaVencimiento()
                : fechaInicio.plusDays(7);

        PromocionResponseDTO promocion = promocionService.crearDesdeSugerencia(
                sugerenciaCreada.getIdSugerencia(),
                "Promo liquidación " + lote.getNumeroLote(),
                sugerencia.getJustificacionIA(),
                sugerencia.getDescuentoSugerido(),
                fechaInicio,
                fechaFin,
                idUsuarioAprueba
        );

        catEstadoAlertaRepository.findByNombreIgnoreCase("EN_PROMOCION")
                .map(CatEstadoAlerta::getIdEstadoAlerta)
                .ifPresent(idEnPromocion -> descartarAlertaJdbc(idAlerta, idEnPromocion));

        return promocion;
    }

    private void descartarAlertaJdbc(Integer idAlerta, Integer idEstado) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_descartar_alerta_caducidad(?, ?)")) {
                ps.setInt(1, idAlerta);
                ps.setInt(2, idEstado);
                ps.execute();
            }
            return null;
        });
    }

    private void crearSugerenciaJdbc(BigDecimal porcentajeDescuento, String observaciones, Integer idLote,
                                      Integer idTemporada, Integer idEjecucion, Integer idEstadoAprobacion) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_sugerencia_ia(?, ?, ?, ?, ?, ?)")) {
                ps.setBigDecimal(1, porcentajeDescuento);
                ps.setString(2, observaciones);
                ps.setInt(3, idLote);
                ps.setInt(4, idTemporada);
                ps.setInt(5, idEjecucion);
                ps.setInt(6, idEstadoAprobacion);
                ps.execute();
            }
            return null;
        });
    }

    /** Estimación rápida del descuento sugerido para mostrar en el listado (no persiste nada) */
    private BigDecimal sugerenciaDescuentoEstimado(AlertaCaducidad a) {
        if (a.getLote() == null) return null;
        try {
            return motorSugerenciaIAService.generarSugerenciaParaLote(a.getLote()).getDescuentoSugerido();
        } catch (Exception e) {
            return null;
        }
    }

    private Integer resolverTemporadaParaSugerencia() {
        Integer idEstadoActiva = catEstadoTemporadaRepository.findByNombreIgnoreCase("ACTIVA")
                .map(CatEstadoTemporada::getIdEstadoTemporada)
                .orElse(null);
        if (idEstadoActiva != null) {
            List<TemporadaAgricola> activas = temporadaRepository.findActivasEnFecha(LocalDate.now(), idEstadoActiva);
            if (!activas.isEmpty()) return activas.get(0).getIdTemporada();
        }
        TemporadaAgricola ultima = temporadaRepository.findTopByOrderByIdTemporadaDesc();
        if (ultima == null) {
            throw new IllegalStateException("No hay ninguna temporada agrícola registrada; regístrela antes de generar sugerencias.");
        }
        return ultima.getIdTemporada();
    }

    private Integer registrarEjecucionMotor(SugerenciaComboDTO sugerencia) {
        ModeloIA modelo = modeloIARepository.findByNombreModeloIgnoreCase(NOMBRE_MODELO_REGLAS)
                .orElseGet(() -> {
                    jdbcTemplate.execute((Connection conn) -> {
                        try (PreparedStatement ps = conn.prepareStatement(
                                "SELECT ia_alertas.fn_crear_modelo_ia(?, ?, ?)")) {
                            ps.setString(1, NOMBRE_MODELO_REGLAS);
                            ps.setString(2, VERSION_MODELO_REGLAS);
                            ps.setString(3, "Motor de reglas ponderadas (urgencia FEFO + temporada + categoría), sin API de IA externa.");
                            ps.execute();
                        }
                        return null;
                    });
                    return modeloIARepository.findTopByOrderByIdModeloDesc();
                });

        String parametros = "score=" + sugerencia.getScore() + ", descuento=" + sugerencia.getDescuentoSugerido();
        Integer idModelo = modelo.getIdModelo();
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_ejecucion_ia(?, ?)")) {
                ps.setString(1, parametros);
                ps.setInt(2, idModelo);
                ps.execute();
            }
            return null;
        });
        EjecucionIA ejecucion = ejecucionIARepository.findTopByOrderByIdEjecucionDesc();
        return ejecucion.getIdEjecucion();
    }
}
