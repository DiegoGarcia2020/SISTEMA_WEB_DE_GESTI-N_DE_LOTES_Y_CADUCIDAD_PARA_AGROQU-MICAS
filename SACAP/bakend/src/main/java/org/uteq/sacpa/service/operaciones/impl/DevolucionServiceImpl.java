package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.DevolucionRequestDTO;
import org.uteq.sacpa.entity.operaciones.Devolucion;
import org.uteq.sacpa.repository.operaciones.IDevolucionRepository;
import org.uteq.sacpa.service.operaciones.IDevolucionService;

import java.util.List;

@Service
public class DevolucionServiceImpl implements IDevolucionService {

    @Autowired
    private IDevolucionRepository devolucionRepository;

    @Autowired
    private org.uteq.sacpa.repository.inventario.ILoteRepository loteRepository;

    @Autowired
    private org.uteq.sacpa.repository.ia_alertas.ISugerenciaIARepository sugerenciaRepository;

    @Override
    public void crearDevolucion(DevolucionRequestDTO dto) {
        devolucionRepository.crearDevolucion(
                dto.getMotivo() != null ? dto.getMotivo() : "Devolución por defectos al proveedor",
                dto.getCantidadDevuelta(),
                dto.getIdLote(),
                dto.getIdProveedor(),
                null,
                dto.getIdEstadoAprobacion() != null ? dto.getIdEstadoAprobacion() : 2 // 2: Pendiente
        );
    }

    @Override
    public List<Devolucion> buscarPorLote(Integer idLote) {
        return devolucionRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void aprobarDevolucion(Integer idDevolucion, Integer idUsuarioAprobador, String observacionesAprobador, Integer idEstadoAprobado) {
        devolucionRepository.aprobarDevolucion(idDevolucion, idEstadoAprobado);
    }

    @Override
    public void anularDevolucion(Integer idDevolucion, Integer idEstadoAnulado) {
        devolucionRepository.anularDevolucion(idDevolucion, idEstadoAnulado, null);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Devolucion> listarPendientes() {
        return devolucionRepository.findAll().stream()
                .filter(d -> d.getIdEstadoAprobacion() != null && d.getIdEstadoAprobacion() == 2)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Devolucion> listarTodos() {
        return devolucionRepository.findAll();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void cambiarEstadoDevolucion(Integer idDevolucion, org.uteq.sacpa.dto.operaciones.CambioEstadoDevolucionDTO dto) {
        Devolucion dev = devolucionRepository.findById(idDevolucion)
                .orElseThrow(() -> new RuntimeException("Devolución no encontrada con ID: " + idDevolucion));

        if (dto.getIdEstadoAprobacion() == 1) {
            // 1: Aprobado por el Supervisor
            devolucionRepository.aprobarDevolucion(idDevolucion, 1);

            // Ajustar stock en inventario (restar las unidades devueltas por defectos al proveedor)
            if (dev.getLote() != null && dev.getCantidad() != null) {
                org.uteq.sacpa.entity.inventario.Lote lote = dev.getLote();
                int nuevoStock = Math.max(0, (lote.getCantidadActual() != null ? lote.getCantidadActual() : 0) - dev.getCantidad());
                lote.setCantidadActual(nuevoStock);
                loteRepository.save(lote);

                // Disparar Alerta / Sugerencia IA para venta o rotación de productos por defectos/devolución
                try {
                    sugerenciaRepository.crearSugerencia(
                            java.math.BigDecimal.valueOf(15.00),
                            "Alerta IA SACPA: Devolución aprobada por defectos (" + dev.getMotivo() + "). Se sugiere auditar lote y considerar promoción/combo de rotación para mitigar merma.",
                            lote.getIdLote(),
                            null,
                            null,
                            2 // 2: Pendiente de revisión comercial
                    );
                } catch (Exception e) {
                    System.err.println("Advertencia: No se pudo generar sugerencia IA automática para la devolución: " + e.getMessage());
                }
            }
        } else if (dto.getIdEstadoAprobacion() == 3) {
            // 3: Rechazado
            devolucionRepository.anularDevolucion(idDevolucion, 3, null);
        } else {
            // Actualizar motivo u observación si sigue pendiente
            devolucionRepository.actualizarDevolucion(idDevolucion, dto.getObservacionSupervisor() != null ? dto.getObservacionSupervisor() : "Revisado por Supervisor");
        }
    }
}
