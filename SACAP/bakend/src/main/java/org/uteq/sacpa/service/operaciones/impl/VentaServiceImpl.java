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
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.operaciones.VentaRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.operaciones.IVentaService;
import org.uteq.sacpa.util.EstadoVenta;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class VentaServiceImpl implements IVentaService {


    private final VentaRepository ventaRepository;
    private final IClienteRepository clienteRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IProductoRepository productoRepository;
    private final ILoteRepository loteRepository;
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
                .estado(EstadoVenta.CONFIRMADA.name())
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

            int stockDisponible = loteRepository.findByProducto(detReq.getIdProducto()).stream()
                    .mapToInt(l -> (l.getCantidadActual() != null ? l.getCantidadActual() : 0) 
                                 - (l.getCantidadReservada() != null ? l.getCantidadReservada() : 0))
                    .sum();
            
            if (stockDisponible < detReq.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + producto.getNombre() 
                    + ". Disponible: " + stockDisponible + ", solicitado: " + detReq.getCantidad());
            }

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

    @Override
    @Transactional(readOnly = true)

    public VentaResponseDTO obtenerPorId(Integer id, Integer idTecnicoFiltro) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));
        if (idTecnicoFiltro != null && !venta.getTecnico().getIdUsuario().equals(idTecnicoFiltro)) {
            throw new org.uteq.sacpa.exception.AccesoDenegadoException("No tiene permisos para ver esta venta.");
        }
        return mapToResponseDTO(venta);

    }

    @Override
    @Transactional(readOnly = true)

    public List<VentaResponseDTO> listarVentas(Integer idTecnicoFiltro) {
        List<Venta> ventas = (idTecnicoFiltro != null) ? 
            ventaRepository.findByTecnico_IdUsuario(idTecnicoFiltro) : 
            ventaRepository.findAll();
        
        return ventas.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

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
