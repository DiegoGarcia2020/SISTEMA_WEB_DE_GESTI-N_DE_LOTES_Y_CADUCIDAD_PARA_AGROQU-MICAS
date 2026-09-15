package org.uteq.sacpa.service.operaciones.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.operaciones.DevolucionVentaRequestDTO;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.operaciones.DevolucionVenta;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.operaciones.DevolucionVentaRepository;
import org.uteq.sacpa.repository.operaciones.ITecnicoCampoRepository;
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
    private final ITecnicoCampoRepository tecnicoCampoRepository;
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
        devolucion.setEstadoInventario(estadoInventario); // CUARENTENA, DISPONIBLE, EMPAQUE_DANADO o DESECHADO
        devolucion.setFechaRecepcion(LocalDateTime.now());

        // CUARENTENA / DESECHADO no vuelven a stock vendible, pero deben quedar físicamente
        // ubicados (AGROCALIDAD Res. 0227, Anexo 1 punto 12) en una zona marcada es_cuarentena,
        // para que no se pierda la trazabilidad de dónde está el producto retenido.
        if ((EstadoInventarioDevolucion.CUARENTENA.name().equals(estadoInventario) ||
             EstadoInventarioDevolucion.DESECHADO.name().equals(estadoInventario))
                && request.getIdUbicacionDestino() != null) {
            org.uteq.sacpa.entity.inventario.UbicacionInterna ubicacionCuarentena =
                    ubicacionRepository.findById(request.getIdUbicacionDestino())
                            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ubicación de cuarentena no encontrada: " + request.getIdUbicacionDestino()));
            validarZonaDeCuarentena(ubicacionCuarentena);
            devolucion.setUbicacionCuarentena(ubicacionCuarentena);
        }

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

                // Empaque dañado: producto en buen estado pero segregado hasta reempacar. Debe
                // caer en una zona es_cuarentena igual que CUARENTENA -- antes esto solo lo
                // garantizaba el filtro del combo en el frontend, no el backend.
                if (EstadoInventarioDevolucion.EMPAQUE_DANADO.name().equals(estadoInventario)) {
                    validarZonaDeCuarentena(nuevaUbicacion);
                }

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

    /** La ubicación destino de un producto retenido (cuarentena/empaque dañado) debe estar en una zona marcada es_cuarentena. */
    private void validarZonaDeCuarentena(org.uteq.sacpa.entity.inventario.UbicacionInterna ubicacion) {
        boolean esCuarentena = ubicacion.getEstanteria() != null
                && ubicacion.getEstanteria().getZona() != null
                && Boolean.TRUE.equals(ubicacion.getEstanteria().getZona().getEsCuarentena());
        if (!esCuarentena) {
            throw new org.uteq.sacpa.exception.BadRequestException("La ubicación seleccionada no pertenece a una zona de cuarentena. "
                    + "Los productos retenidos deben ubicarse en una zona marcada como cuarentena.");
        }
    }

    private org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO toResponseDTO(DevolucionVenta d) {
        return org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO.builder()
                .id(d.getId())
                .idVenta(d.getVenta().getId())
                .numeroComprobante(d.getVenta().getNumeroComprobante())
                .nombreCliente(d.getVenta().getCliente().getNombreFinca())
                .nombreTecnico(resolverNombreTecnico(d.getVenta().getTecnico()))
                .idProducto(d.getProducto().getIdProducto())
                .nombreProducto(d.getProducto().getNombre())
                .cantidadDevuelta(d.getCantidadDevuelta())
                .motivo(d.getMotivo())
                .fechaSolicitud(d.getFechaSolicitud())
                .estadoLogistico(d.getEstadoLogistico())
                .estadoInventario(d.getEstadoInventario())
                .fechaRecepcion(d.getFechaRecepcion())
                .ubicacionCuarentena(formatearUbicacion(d.getUbicacionCuarentena()))
                .build();
    }

    private String formatearUbicacion(org.uteq.sacpa.entity.inventario.UbicacionInterna u) {
        if (u == null) return null;
        String estanteria = u.getEstanteria() != null ? u.getEstanteria().getCodigo() : "?";
        return estanteria + " - " + u.getNivel() + (u.getPosicion() != null ? "/" + u.getPosicion() : "");
    }

    /**
     * Usuario.nombres/apellidos queda vacío para técnicos sembrados directo por SQL
     * (solo se llena al pasar por el flujo de registro/aprobación). El nombre real
     * vive en el perfil operaciones.tecnico_campo, así que se cae ahí antes de
     * mostrar el correo como último recurso.
     */
    private String resolverNombreTecnico(Usuario tecnico) {
        if (tecnico == null) return "Técnico no disponible";

        String nombres = tecnico.getNombres();
        String apellidos = tecnico.getApellidos();
        if (nombres != null && !nombres.isBlank() && apellidos != null && !apellidos.isBlank()) {
            return (nombres + " " + apellidos).trim();
        }

        String nombreCompleto = tecnicoCampoRepository.findByUsuario_IdUsuario(tecnico.getIdUsuario())
                .map(t -> (safe(t.getNombres()) + " " + safe(t.getApellidos())).trim())
                .filter(n -> !n.isBlank())
                .orElse(null);
        if (nombreCompleto != null) return nombreCompleto;

        return tecnico.getCorreo();
    }

    private String safe(String valor) {
        return valor != null ? valor : "";
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
