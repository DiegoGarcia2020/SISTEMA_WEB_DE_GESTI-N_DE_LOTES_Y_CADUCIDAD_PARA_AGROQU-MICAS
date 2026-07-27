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
import org.uteq.sacpa.repository.operaciones.DevolucionVentaRepository;
import org.uteq.sacpa.repository.operaciones.VentaRepository;
import org.uteq.sacpa.service.operaciones.IDevolucionVentaService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DevolucionVentaServiceImpl implements IDevolucionVentaService {

    private final DevolucionVentaRepository devolucionVentaRepository;
    private final VentaRepository ventaRepository;
    private final IProductoRepository productoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public DevolucionVenta registrarDevolucionCampo(DevolucionVentaRequestDTO requestDTO) {
        Venta venta = ventaRepository.findById(requestDTO.getIdVenta())
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + requestDTO.getIdVenta()));
        
        Producto producto = productoRepository.findById(requestDTO.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + requestDTO.getIdProducto()));

        if (!"ENTREGADA".equals(venta.getEstado())) {
            throw new RuntimeException("Solo se pueden reportar devoluciones de ventas ENTREGADAS.");
        }

        // Cambiar estado de la venta
        venta.setEstado("DEVUELTA_PARCIALMENTE");
        ventaRepository.save(venta);

        DevolucionVenta devolucion = DevolucionVenta.builder()
                .venta(venta)
                .producto(producto)
                .cantidadDevuelta(requestDTO.getCantidadDevuelta())
                .motivo(requestDTO.getMotivo())
                .fechaSolicitud(LocalDateTime.now())
                .estadoLogistico("EN_TRANSITO")
                .build();

        devolucion = devolucionVentaRepository.save(devolucion);

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

        if (!"EN_TRANSITO".equals(devolucion.getEstadoLogistico())) {
            throw new RuntimeException("La devolución ya fue recibida o está en estado incorrecto.");
        }

        devolucion.setEstadoLogistico("RECIBIDO_BODEGA");
        devolucion.setEstadoInventario(estadoInventario); // CUARENTENA o DISPONIBLE

        return devolucionVentaRepository.save(devolucion);
    }
}
