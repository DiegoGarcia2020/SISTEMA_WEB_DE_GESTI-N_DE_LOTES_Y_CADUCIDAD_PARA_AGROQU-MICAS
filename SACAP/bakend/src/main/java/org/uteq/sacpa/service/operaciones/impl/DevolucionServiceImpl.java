package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.DevolucionRequestDTO;
import org.uteq.sacpa.entity.operaciones.Devolucion;
import org.uteq.sacpa.repository.operaciones.IDevolucionRepository;
import org.uteq.sacpa.service.operaciones.IDevolucionService;

import java.util.List;
import java.util.stream.Collectors;
import org.uteq.sacpa.dto.operaciones.DevolucionResumenDTO;

@Service
public class DevolucionServiceImpl implements IDevolucionService {

    @Autowired
    private IDevolucionRepository devolucionRepository;

    @Autowired
    private org.uteq.sacpa.repository.inventario.ILoteRepository loteRepository;

    @Autowired
    private org.uteq.sacpa.repository.ia_alertas.ISugerenciaIARepository sugerenciaRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Vía JdbcTemplate: "SELECT fn(...)" con executeUpdate() (usado por @Modifying) falla en Postgres
    // para funciones que retornan void — ver LoteServiceImpl.preRegistrarLote para el mismo patrón.
    private void crearSugerenciaJdbc(java.math.BigDecimal porcentajeDescuento, String observaciones, Integer idLote,
                                      Integer idTemporada, Integer idEjecucion, Integer idEstadoAprobacion) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_sugerencia_ia(?, ?, ?, ?, ?, ?)")) {
                ps.setBigDecimal(1, porcentajeDescuento);
                ps.setString(2, observaciones);
                ps.setInt(3, idLote);
                if (idTemporada != null) ps.setInt(4, idTemporada); else ps.setNull(4, java.sql.Types.INTEGER);
                if (idEjecucion != null) ps.setInt(5, idEjecucion); else ps.setNull(5, java.sql.Types.INTEGER);
                ps.setInt(6, idEstadoAprobacion);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    public void crearDevolucion(DevolucionRequestDTO dto) {
        String motivo = dto.getMotivo() != null ? dto.getMotivo() : "Devolución por defectos al proveedor";
        Integer idEstado = dto.getIdEstadoAprobacion() != null ? dto.getIdEstadoAprobacion() : 2;

        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.PreparedStatement ps = conn.prepareStatement("SELECT operaciones.fn_crear_devolucion(?, ?, ?, ?, ?, ?)")) {
                ps.setString(1, motivo);
                ps.setInt(2, dto.getCantidadDevuelta());
                ps.setInt(3, dto.getIdLote());
                ps.setInt(4, dto.getIdProveedor());
                ps.setNull(5, java.sql.Types.INTEGER);
                ps.setInt(6, idEstado);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    public List<Devolucion> buscarPorLote(Integer idLote) {
        return devolucionRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void aprobarDevolucion(Integer idDevolucion, Integer idUsuarioAprobador, String observacionesAprobador, Integer idEstadoAprobado) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.PreparedStatement ps = conn.prepareStatement("SELECT operaciones.fn_aprobar_devolucion(?, ?)")) {
                ps.setInt(1, idDevolucion);
                ps.setInt(2, idEstadoAprobado);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    public void anularDevolucion(Integer idDevolucion, Integer idEstadoAnulado) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.PreparedStatement ps = conn.prepareStatement("SELECT operaciones.fn_anular_devolucion(?, ?, ?)")) {
                ps.setInt(1, idDevolucion);
                ps.setInt(2, idEstadoAnulado);
                ps.setNull(3, java.sql.Types.INTEGER);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<DevolucionResumenDTO> listarPendientes() {
        return devolucionRepository.findTop50ByIdEstadoAprobacionOrderByFechaDevolucionDesc(2)
                .stream()
                .map(DevolucionResumenDTO::from)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<DevolucionResumenDTO> listarTodos() {
        return devolucionRepository.findTop50ByOrderByFechaDevolucionDesc()
                .stream()
                .map(DevolucionResumenDTO::from)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void cambiarEstadoDevolucion(Integer idDevolucion, org.uteq.sacpa.dto.operaciones.CambioEstadoDevolucionDTO dto) {
        Devolucion dev = devolucionRepository.findById(idDevolucion)
                .orElseThrow(() -> new RuntimeException("Devolución no encontrada con ID: " + idDevolucion));

        if (dto.getIdEstadoAprobacion() == 1) {
            // 1: Aprobado por el Supervisor
            this.aprobarDevolucion(idDevolucion, null, null, 1);

            // Ajustar stock en inventario (restar las unidades devueltas por defectos al proveedor)
            if (dev.getLote() != null && dev.getCantidad() != null) {
                org.uteq.sacpa.entity.inventario.Lote lote = dev.getLote();
                int nuevoStock = Math.max(0, (lote.getCantidadActual() != null ? lote.getCantidadActual() : 0) - dev.getCantidad());
                lote.setCantidadActual(nuevoStock);
                loteRepository.save(lote);

                // Disparar Alerta / Sugerencia IA para venta o rotación de productos por defectos/devolución
                try {
                    Integer idTemporadaValida = jdbcTemplate.queryForObject("SELECT max(id_temporada) FROM ia_alertas.temporadas_agricolas", Integer.class);
                    if (idTemporadaValida != null) {
                        crearSugerenciaJdbc(
                                java.math.BigDecimal.valueOf(15.00),
                                "Alerta IA SACPA: Devolución aprobada por defectos (" + dev.getMotivo() + "). Se sugiere auditar lote y considerar promoción/combo de rotación para mitigar merma.",
                                lote.getIdLote(),
                                idTemporadaValida,
                                null,
                                2 // 2: Pendiente de revisión comercial
                        );
                    } else {
                        System.err.println("Advertencia: No hay temporadas agrícolas. Omitiendo sugerencia IA.");
                    }
                } catch (Exception e) {
                    System.err.println("Advertencia: No se pudo generar sugerencia IA automática para la devolución: " + e.getMessage());
                }
            }
        } else if (dto.getIdEstadoAprobacion() == 3) {
            // 3: Rechazado
            this.anularDevolucion(idDevolucion, 3);
        } else {
            // Actualizar motivo u observación si sigue pendiente
            String observacion = dto.getObservacionSupervisor() != null ? dto.getObservacionSupervisor() : "Revisado por Supervisor";
            jdbcTemplate.execute((java.sql.Connection conn) -> {
                try (java.sql.PreparedStatement ps = conn.prepareStatement("SELECT operaciones.fn_actualizar_devolucion(?, ?)")) {
                    ps.setInt(1, idDevolucion);
                    ps.setString(2, observacion);
                    ps.execute();
                }
                return null;
            });
        }
    }
}
