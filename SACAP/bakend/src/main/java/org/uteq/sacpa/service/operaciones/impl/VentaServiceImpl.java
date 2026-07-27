package org.uteq.sacpa.service.operaciones.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.operaciones.DetalleVentaRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.operaciones.DetalleVenta;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.entidades.IClienteRepository;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.repository.operaciones.VentaRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.operaciones.IVentaService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VentaServiceImpl implements IVentaService {

    private final VentaRepository ventaRepository;
    private final IClienteRepository clienteRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IProductoRepository productoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final BigDecimal IVA_RATE = new BigDecimal("0.15");

    @Override
    @Transactional
    public Venta crearVenta(VentaRequestDTO request) {
        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + request.getIdCliente()));

        Usuario tecnico = usuarioRepository.findById(request.getIdTecnico())
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado con ID: " + request.getIdTecnico()));

        Venta venta = Venta.builder()
                .cliente(cliente)
                .tecnico(tecnico)
                .fecha(LocalDateTime.now())
                .numeroComprobante("VEN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .estado("CONFIRMADA")
                .costoEnvio(request.getCostoEnvio() != null ? request.getCostoEnvio() : BigDecimal.ZERO)
                .metodoPago(request.getMetodoPago())
                .referenciaPago(request.getReferenciaPago())
                .fechaEstimadaEntrega(request.getFechaEstimadaEntrega())
                .ventanaHoraria(request.getVentanaHoraria())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (DetalleVentaRequestDTO detReq : request.getDetalles()) {
            Producto producto = productoRepository.findById(detReq.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + detReq.getIdProducto()));

            BigDecimal precio = producto.getPrecio();
            BigDecimal subtotalDetalle = precio.multiply(BigDecimal.valueOf(detReq.getCantidad()));

            DetalleVenta detalle = DetalleVenta.builder()
                    .producto(producto)
                    .cantidad(detReq.getCantidad())
                    .precioUnitario(precio)
                    .subtotal(subtotalDetalle)
                    .esSugerenciaIa(detReq.getEsSugerenciaIa() != null ? detReq.getEsSugerenciaIa() : false)
                    .build();

            venta.agregarDetalle(detalle);
            subtotal = subtotal.add(subtotalDetalle);
        }

        BigDecimal iva = subtotal.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(iva).setScale(2, RoundingMode.HALF_UP);

        venta.setSubtotal(subtotal);
        venta.setIvaAplicado(iva);
        venta.setTotal(total);

        venta = ventaRepository.save(venta);

        // Notificar por WebSocket al Bodeguero
        String mensaje = String.format("{\"tipo\": \"NUEVA_VENTA\", \"idVenta\": %d, \"mensaje\": \"Nueva orden de venta confirmada para cliente %s\"}", 
            venta.getId(), cliente.getNombreFinca());
        messagingTemplate.convertAndSend("/topic/bodega/despachos", mensaje);

        return venta;
    }
}
