package org.uteq.sacpa.service.operaciones.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.operaciones.DevolucionVentaRequestDTO;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.operaciones.DevolucionVenta;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.operaciones.DevolucionVentaRepository;
import org.uteq.sacpa.repository.operaciones.VentaRepository;
import org.uteq.sacpa.service.operaciones.IDevolucionVentaService;
import org.uteq.sacpa.util.EstadoVenta;
import org.uteq.sacpa.util.EstadoLogisticoDevolucion;
import org.uteq.sacpa.util.EstadoInventarioDevolucion;
import org.springframework.beans.factory.annotation.Value;
import org.uteq.sacpa.entity.operaciones.DetalleVenta;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DevolucionVentaServiceImpl implements IDevolucionVentaService {

    private final DevolucionVentaRepository devolucionVentaRepository;
    private final VentaRepository ventaRepository;
    private final IProductoRepository productoRepository;
    private final ILoteRepository loteRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${sacpa.devolucion.plazo-dias:7}")
    private int plazoDiasDevolucion;

    @Override
    @Transactional
    public DevolucionVenta registrarDevolucionCampo(DevolucionVentaRequestDTO requestDTO) {
        Venta venta = ventaRepository.findById(requestDTO.getIdVenta())
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + requestDTO.getIdVenta()));
        
        Producto producto = productoRepository.findById(requestDTO.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + requestDTO.getIdProducto()));

        if (!EstadoVenta.ENTREGADA.name().equals(venta.getEstado())) {
            throw new RuntimeException("Solo se pueden reportar devoluciones de ventas ENTREGADAS.");
        }

        if (venta.getFecha().plusDays(plazoDiasDevolucion).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El plazo de devolución de " + plazoDiasDevolucion 
                + " días ha expirado. La venta fue entregada el " + venta.getFecha());
        }

        DevolucionVenta devolucion = DevolucionVenta.builder()
                .venta(venta)
                .producto(producto)
                .cantidadDevuelta(requestDTO.getCantidadDevuelta())
                .motivo(requestDTO.getMotivo())
                .fechaSolicitud(LocalDateTime.now())
                .estadoLogistico(EstadoLogisticoDevolucion.EN_TRANSITO.name())
                // No asignamos lote aún, se lo identifica en bodega
                .build();

        devolucion = devolucionVentaRepository.save(devolucion);

        int totalVendido = venta.getDetalles().stream().mapToInt(DetalleVenta::getCantidad).sum();
        int totalDevuelto = devolucionVentaRepository.findByVenta_Id(venta.getId()).stream()
                .mapToInt(DevolucionVenta::getCantidadDevuelta).sum();
        
        venta.setEstado(totalDevuelto >= totalVendido 
            ? EstadoVenta.DEVUELTA_TOTAL.name() 
            : EstadoVenta.DEVUELTA_PARCIALMENTE.name());
        ventaRepository.save(venta);
        // Notificar a Bodega de que viene un paquete de vuelta
        String mensaje = String.format("{\"tipo\": \"DEVOLUCION_EN_TRANSITO\", \"idDevolucion\": %d, \"idVenta\": %d}", 
            devolucion.getId(), venta.getId());
        messagingTemplate.convertAndSend("/topic/bodega/devoluciones", mensaje);

        return devolucion;
    }

    @Override
    @Transactional
    public DevolucionVenta recibirDevolucionFisica(Integer idDevolucion, String estadoInventario) {
        DevolucionVenta devolucion = devolucionVentaRepository.findById(idDevolucion)
                .orElseThrow(() -> new RuntimeException("Devolución no encontrada con ID: " + idDevolucion));

        if (!EstadoLogisticoDevolucion.EN_TRANSITO.name().equals(devolucion.getEstadoLogistico())) {
            throw new RuntimeException("La devolución ya fue recibida o está en estado incorrecto.");
        }

        devolucion.setEstadoLogistico(EstadoLogisticoDevolucion.RECIBIDO_BODEGA.name());
        devolucion.setEstadoInventario(estadoInventario); // CUARENTENA o DISPONIBLE

        // Reintegro de stock y trazabilidad
        if (EstadoInventarioDevolucion.DISPONIBLE.name().equals(estadoInventario)) {
            // Buscamos un lote activo para este producto (Idealmente se debe elegir en frontend, por ahora tomamos el primero FEFO)
            java.util.List<org.uteq.sacpa.entity.inventario.Lote> lotes = loteRepository.findByProductoForUpdate(devolucion.getProducto().getIdProducto());
            if (lotes.isEmpty()) {
                throw new RuntimeException("No hay un lote activo de este producto para reintegrar el stock.");
            }
            org.uteq.sacpa.entity.inventario.Lote loteReintegro = lotes.get(0);
            
            loteReintegro.setCantidadActual(
                (loteReintegro.getCantidadActual() != null ? loteReintegro.getCantidadActual() : 0) + devolucion.getCantidadDevuelta()
            );
            loteRepository.save(loteReintegro);
            devolucion.setLote(loteReintegro);
        }

        return devolucionVentaRepository.save(devolucion);
    }
}
