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
import org.uteq.sacpa.repository.inventario.IUbicacionInternaRepository;
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
    private final IUbicacionInternaRepository ubicacionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${sacpa.devolucion.plazo-dias:7}")
    private int plazoDiasDevolucion;

    @Override
    @Transactional
    public org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO registrarDevolucionCampo(DevolucionVentaRequestDTO requestDTO) {
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

        return toResponseDTO(devolucion);
    }

    @Override
    @Transactional
    public org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO recibirDevolucionFisica(Integer idDevolucion, org.uteq.sacpa.dto.operaciones.DevolucionFisicaRequestDTO request) {
        DevolucionVenta devolucion = devolucionVentaRepository.findById(idDevolucion)
                .orElseThrow(() -> new RuntimeException("Devolución no encontrada con ID: " + idDevolucion));

        if (!EstadoLogisticoDevolucion.EN_TRANSITO.name().equals(devolucion.getEstadoLogistico())) {
            throw new RuntimeException("La devolución ya fue recibida o está en estado incorrecto.");
        }

        String estadoInventario = request.getEstadoInventario();

        devolucion.setEstadoLogistico(EstadoLogisticoDevolucion.RECIBIDO_BODEGA.name());
        devolucion.setEstadoInventario(estadoInventario); // CUARENTENA, DISPONIBLE o DESECHADO
        devolucion.setFechaRecepcion(LocalDateTime.now());

        // Reintegro de stock y trazabilidad
        if (EstadoInventarioDevolucion.DISPONIBLE.name().equals(estadoInventario) ||
            EstadoInventarioDevolucion.EMPAQUE_DANADO.name().equals(estadoInventario)) {
            org.uteq.sacpa.entity.inventario.Lote loteReintegro;
            
            if (request.getIdLoteDestino() != null) {
                loteReintegro = loteRepository.findByIdForUpdate(request.getIdLoteDestino())
                        .orElseThrow(() -> new RuntimeException("Lote destino no encontrado: " + request.getIdLoteDestino()));
            } else {
                java.util.List<org.uteq.sacpa.entity.inventario.Lote> lotes = loteRepository.findByProductoForUpdate(devolucion.getProducto().getIdProducto());
                if (lotes.isEmpty()) {
                    throw new RuntimeException("No hay un lote activo de este producto para reintegrar el stock.");
                }
                loteReintegro = lotes.get(0);
            }

            Integer idUbicacionDestino = request.getIdUbicacionDestino();
            if (idUbicacionDestino != null && (loteReintegro.getUbicacion() == null || !loteReintegro.getUbicacion().getIdUbicacion().equals(idUbicacionDestino))) {
                org.uteq.sacpa.entity.inventario.UbicacionInterna nuevaUbicacion = ubicacionRepository.findById(idUbicacionDestino)
                        .orElseThrow(() -> new RuntimeException("Ubicación destino no encontrada: " + idUbicacionDestino));
                
                // Validar capacidad
                int capacidadOcupada = 0;
                for (Object[] row : loteRepository.sumCantidadActualAgrupadoPorUbicacion()) {
                    if (row[0] != null && row[0].equals(idUbicacionDestino)) {
                        capacidadOcupada = ((Number) row[1]).intValue();
                        break;
                    }
                }
                
                int capacidadMaxima = nuevaUbicacion.getCapacidadMaxima() != null ? nuevaUbicacion.getCapacidadMaxima() : 0;
                int disponible = Math.max(0, capacidadMaxima - capacidadOcupada);
                
                if (devolucion.getCantidadDevuelta() > disponible) {
                    String nombreUbicacion = (nuevaUbicacion.getEstanteria() != null ? nuevaUbicacion.getEstanteria().getCodigo() + " - " : "") + nuevaUbicacion.getNivel();
                    throw new RuntimeException("La ubicación " + nombreUbicacion + 
                        " no tiene capacidad suficiente. Disponible: " + disponible + 
                        ", requerido: " + devolucion.getCantidadDevuelta() + ".");
                }
                
                loteReintegro.setUbicacion(nuevaUbicacion);
            }
            
            loteReintegro.setCantidadActual(
                (loteReintegro.getCantidadActual() != null ? loteReintegro.getCantidadActual() : 0) + devolucion.getCantidadDevuelta()
            );
            loteRepository.save(loteReintegro);
            devolucion.setLote(loteReintegro);
        }

        return toResponseDTO(devolucionVentaRepository.save(devolucion));
    }

    private org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO toResponseDTO(DevolucionVenta d) {
        return org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO.builder()
                .id(d.getId())
                .idVenta(d.getVenta().getId())
                .numeroComprobante(d.getVenta().getNumeroComprobante())
                .nombreCliente(d.getVenta().getCliente().getNombreFinca())
                .nombreTecnico(d.getVenta().getTecnico().getNombres() + " " + d.getVenta().getTecnico().getApellidos())
                .idProducto(d.getProducto().getIdProducto())
                .nombreProducto(d.getProducto().getNombre())
                .cantidadDevuelta(d.getCantidadDevuelta())
                .motivo(d.getMotivo())
                .fechaSolicitud(d.getFechaSolicitud())
                .estadoLogistico(d.getEstadoLogistico())
                .estadoInventario(d.getEstadoInventario())
                .fechaRecepcion(d.getFechaRecepcion())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO> listarPendientesBodega(org.springframework.data.domain.Pageable pageable) {
        return devolucionVentaRepository.findByEstadoLogistico(EstadoLogisticoDevolucion.EN_TRANSITO.name(), pageable)
                .map(this::toResponseDTO);
    }
    @Override
    @Transactional(readOnly = true)
    public java.util.List<org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO> listarPorTecnico(Integer idTecnico) {
        return devolucionVentaRepository.findByTecnico(idTecnico)
                .stream()
                .map(this::toResponseDTO)
                .collect(java.util.stream.Collectors.toList());
    }
}
