package org.uteq.sacpa.service.operaciones.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.operaciones.OrdenPendienteDespachoDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.repository.operaciones.VentaRepository;
import org.uteq.sacpa.service.operaciones.IDespachoService;
import org.uteq.sacpa.util.EstadoVenta;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DespachoServiceImpl implements IDespachoService {

    private final VentaRepository ventaRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<OrdenPendienteDespachoDTO> listarPendientesPreparar(String busqueda) {
        List<Venta> ventas = (busqueda == null || busqueda.isBlank())
                ? ventaRepository.findTop50ByEstadoOrderByFechaDesc(EstadoVenta.CONFIRMADA.name())
                : ventaRepository.buscarPendientesPreparar(EstadoVenta.CONFIRMADA.name(), busqueda.trim(), PageRequest.of(0, 50));

        return ventas.stream()
                .map(OrdenPendienteDespachoDTO::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VentaResponseDTO marcarComoPreparada(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + idVenta));

        if (!EstadoVenta.CONFIRMADA.name().equals(venta.getEstado()) && !"PENDIENTE".equals(venta.getEstado())) {
            throw new RuntimeException("La venta no está en estado válido para ser preparada.");
        }

        venta.setEstado(EstadoVenta.PREPARADA.name());
        venta = ventaRepository.save(venta);

        // Notificar al Técnico vía WebSocket
        String mensaje = String.format("{\"tipo\": \"PAQUETE_PREPARADO\", \"idVenta\": %d, \"mensaje\": \"El paquete de la venta %d está listo para despacho\"}",
            venta.getId(), venta.getId());
        messagingTemplate.convertAndSend("/topic/campo/despachos", mensaje);

        return mapToResponseDTO(venta);
    }

    @Override
    @Transactional
    public VentaResponseDTO confirmarEntrega(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + idVenta));

        if (!EstadoVenta.PREPARADA.name().equals(venta.getEstado())) {
            throw new RuntimeException("La venta debe estar PREPARADA antes de ser entregada.");
        }

        venta.setEstado(EstadoVenta.ENTREGADA.name());
        venta = ventaRepository.save(venta);

        // Notificar al Bodeguero que se entregó (opcional para trazabilidad)
        String mensaje = String.format("{\"tipo\": \"PAQUETE_ENTREGADO\", \"idVenta\": %d}", venta.getId());
        messagingTemplate.convertAndSend("/topic/bodega/despachos", mensaje);

        return mapToResponseDTO(venta);
    }

    // Materializa las asociaciones lazy (cliente, técnico, detalles) dentro de la transacción —
    // con spring.jpa.open-in-view=false, devolver la entidad tal cual revienta con
    // LazyInitializationException al serializar la respuesta fuera de la sesión de Hibernate.
    private VentaResponseDTO mapToResponseDTO(Venta venta) {
        List<VentaResponseDTO.DetalleVentaResponseDTO> detallesDTO = venta.getDetalles().stream()
                .map(d -> VentaResponseDTO.DetalleVentaResponseDTO.builder()
                        .idProducto(d.getProducto() != null ? d.getProducto().getIdProducto() : null)
                        .nombreProducto(d.getProducto() != null ? d.getProducto().getNombre() : "Desconocido")
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .subtotal(d.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return VentaResponseDTO.builder()
                .id(venta.getId())
                .cliente(venta.getCliente() != null ? venta.getCliente().getNombreFinca() : "N/A")
                .tecnico(venta.getTecnico() != null ? venta.getTecnico().getNombres() : "N/A")
                .fecha(venta.getFecha())
                .numeroComprobante(venta.getNumeroComprobante())
                .estado(venta.getEstado())
                .subtotal(venta.getSubtotal())
                .ivaAplicado(venta.getIvaAplicado())
                .costoEnvio(venta.getCostoEnvio())
                .total(venta.getTotal())
                .metodoPago(venta.getMetodoPago())
                .referenciaPago(venta.getReferenciaPago())
                .detalles(detallesDTO)
                .build();
    }
}
