package org.uteq.sacpa.service.operaciones.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.repository.operaciones.VentaRepository;
import org.uteq.sacpa.service.operaciones.IDespachoService;
import org.uteq.sacpa.util.EstadoVenta;

@Service
@RequiredArgsConstructor
public class DespachoServiceImpl implements IDespachoService {

    private final VentaRepository ventaRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public Venta marcarComoPreparada(Integer idVenta) {
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

        return venta;
    }

    @Override
    @Transactional
    public Venta confirmarEntrega(Integer idVenta) {
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

        return venta;
    }
}
