package org.uteq.sacpa.service.operaciones.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;
import org.uteq.sacpa.dto.ia_modelos.TemporadaResponseDTO;
import org.uteq.sacpa.dto.operaciones.DetalleVentaIARequestDTO;
import org.uteq.sacpa.dto.operaciones.DetalleVentaResponseDTO;
import org.uteq.sacpa.dto.operaciones.ProductoCatalogoDTO;
import org.uteq.sacpa.dto.operaciones.VentaCreateRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaDashboardResponseDTO;
import org.uteq.sacpa.dto.operaciones.VentaIAResponseDTO;
import org.uteq.sacpa.entity.catalogos.CatCultivo;
import org.uteq.sacpa.entity.catalogos.CatEstadoPromocion;
import org.uteq.sacpa.entity.catalogos.CatEstadoTemporada;
import org.uteq.sacpa.entity.catalogos.CatPlaga;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.entity.ia_alertas.Promocion;
import org.uteq.sacpa.entity.inventario.Categoria;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.operaciones.DetalleVenta;
import org.uteq.sacpa.entity.operaciones.TecnicoCampo;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.repository.catalogos.ICatCultivoRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoPromocionRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoTemporadaRepository;
import org.uteq.sacpa.repository.catalogos.ICatPlagaRepository;
import org.uteq.sacpa.repository.entidades.IClienteRepository;
import org.uteq.sacpa.repository.ia_alertas.IPromocionRepository;
import org.uteq.sacpa.repository.ia_alertas.ITemporadaAgricolaRepository;
import org.uteq.sacpa.repository.inventario.ICategoriaRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.operaciones.IDetalleVentaRepository;
import org.uteq.sacpa.repository.operaciones.ITecnicoCampoRepository;
import org.uteq.sacpa.repository.operaciones.VentaRepository;
import org.uteq.sacpa.service.ia_alertas.IMotorSugerenciaIAService;
import org.uteq.sacpa.service.operaciones.IVentaIAService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class VentaIAServiceImpl implements IVentaIAService {

    private final ITecnicoCampoRepository tecnicoCampoRepository;
    private final IClienteRepository clienteRepository;
    private final ILoteRepository loteRepository;
    private final VentaRepository ventaRepository;
    private final IDetalleVentaRepository detalleVentaRepository;
    private final ITemporadaAgricolaRepository temporadaRepository;
    private final ICatEstadoTemporadaRepository catEstadoTemporadaRepository;
    private final IPromocionRepository promocionRepository;
    private final ICatEstadoPromocionRepository catEstadoPromocionRepository;
    private final IMotorSugerenciaIAService motorSugerenciaIAService;
    private final ICategoriaRepository categoriaRepository;
    private final ICatCultivoRepository catCultivoRepository;
    private final ICatPlagaRepository catPlagaRepository;

    private static final int ID_ESTADO_ACTIVO = 1;

    @Override
    @Transactional(readOnly = true)
    public VentaDashboardResponseDTO obtenerDashboard(Integer idUsuarioAutenticado) {
        List<TemporadaResponseDTO> temporadas = catEstadoTemporadaRepository.findByNombreIgnoreCase("ACTIVA")
                .map(CatEstadoTemporada::getIdEstadoTemporada)
                .map(id -> temporadaRepository.findActivasEnFecha(LocalDate.now(), id))
                .orElse(List.of())
                .stream().map(TemporadaResponseDTO::from).toList();

        List<PromocionResponseDTO> promociones = catEstadoPromocionRepository.findByNombreIgnoreCase("ACTIVA")
                .map(CatEstadoPromocion::getIdEstadoPromocion)
                .map(id -> promocionRepository.findByEstado_IdEstadoPromocion(id, org.springframework.data.domain.PageRequest.of(0, 20)).getContent())
                .orElse(List.of())
                .stream().map(PromocionResponseDTO::from).toList();

        // Consultar ventas directamente por id_usuario (tabla unificada)
        LocalDate hoy = LocalDate.now();
        List<Venta> ventasHoy = ventaRepository.findPorTecnicoEnRango(
                idUsuarioAutenticado, hoy.atStartOfDay(), hoy.plusDays(1).atStartOfDay());
        int cantidadHoy = ventasHoy.size();
        BigDecimal totalHoy = ventasHoy.stream().map(Venta::getTotal).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return VentaDashboardResponseDTO.builder()
                .temporadasActivas(temporadas)
                .promocionesActivas(promociones)
                .ventasHoyCantidad(cantidadHoy)
                .ventasHoyTotal(totalHoy)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> obtenerCategorias() {
        return categoriaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SugerenciaComboDTO> obtenerSugerencias(Integer idCategoria) {
        return motorSugerenciaIAService.generarSugerencias(idCategoria);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatCultivo> obtenerCultivos() {
        return catCultivoRepository.findByIdEstadoOrderByNombreAsc(ID_ESTADO_ACTIVO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatPlaga> obtenerPlagas() {
        return catPlagaRepository.findByIdEstadoOrderByNombreAsc(ID_ESTADO_ACTIVO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SugerenciaComboDTO> obtenerSugerenciasPorPlaga(Integer idPlaga, Integer idCultivo) {
        return motorSugerenciaIAService.generarSugerenciasPorPlaga(idPlaga, idCultivo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoCatalogoDTO> obtenerCatalogo(String q, Integer limit) {
        // En un caso real, esto se haría con un Custom Repository Method o JdbcTemplate.
        // Simulando la agrupación de lotes por producto en orden FEFO
        List<Lote> lotesVendibles;
        if (q != null && !q.trim().isEmpty()) {
            lotesVendibles = loteRepository.findLotesDisponibles(q.trim());
        } else {
            lotesVendibles = loteRepository.findLotesDisponiblesFefo();
        }

        // Agrupar por producto
        java.util.Map<Integer, ProductoCatalogoDTO> catalogoMap = new java.util.LinkedHashMap<>();
        for (Lote lote : lotesVendibles) {
            Integer idProd = lote.getProducto().getIdProducto();
            int disponible = (lote.getCantidadActual() != null ? lote.getCantidadActual() : 0)
                    - (lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0);
            
            if (disponible <= 0) continue;

            if (!catalogoMap.containsKey(idProd)) {
                catalogoMap.put(idProd, ProductoCatalogoDTO.builder()
                        .idProducto(idProd)
                        .nombre(lote.getProducto().getNombre())
                        .descripcion(lote.getProducto().getDescripcion())
                        .unidadMedida(lote.getProducto().getUnidadMedida())
                        .precio(lote.getProducto().getPrecio())
                        .stockDisponible(disponible)
                        .proximaCaducidad(lote.getFechaVencimiento()) // El primero en orden FEFO
                        .build());
            } else {
                ProductoCatalogoDTO dto = catalogoMap.get(idProd);
                dto.setStockDisponible(dto.getStockDisponible() + disponible);
            }
        }

        List<ProductoCatalogoDTO> result = new ArrayList<>(catalogoMap.values());
        
        // Si no hay 'q', y la base soporta order by mas vendidos, aquí podríamos 
        // ordenar la lista 'result' basándonos en historial, 
        // pero por ahora, respetaremos el límite por default y el orden que haya caído (stock).
        
        // Ordenar por stockDisponible DESC como fallback si no hay historial
        if (q == null || q.trim().isEmpty()) {
            result.sort((a, b) -> b.getStockDisponible().compareTo(a.getStockDisponible()));
        }

        if (limit != null && result.size() > limit) {
            return result.subList(0, limit);
        }
        return result;
    }

    @Override
    @Transactional
    public VentaIAResponseDTO crearVenta(Integer idUsuarioAutenticado, VentaCreateRequestDTO dto) {
        TecnicoCampo tecnico = tecnicoCampoRepository.findByUsuario_IdUsuario(idUsuarioAutenticado)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró perfil de Técnico de Campo para este usuario"));

        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + dto.getIdCliente()));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal descuentoTotal = BigDecimal.ZERO;
        List<LineaCalculada> lineasCalculadas = new ArrayList<>();

        for (DetalleVentaIARequestDTO linea : dto.getLineas()) {
            // Obtener todos los lotes vendibles del producto en orden FEFO con bloqueo pesimista
            List<Lote> lotesProducto = loteRepository.findByProductoForUpdate(linea.getIdProducto());
            
            int cantidadSolicitada = linea.getCantidad();
            int cantidadPorCubrir = cantidadSolicitada;
            
            // Filtrar lotes válidos
            List<Lote> lotesValidos = new ArrayList<>();
            for (Lote l : lotesProducto) {
                if (l.getUbicacion() == null) continue; // No vender flotantes
                if (l.getFechaVencimiento() != null && !l.getFechaVencimiento().isAfter(LocalDate.now())) continue;
                if (l.getIdEstadoLote() != ID_ESTADO_ACTIVO) continue;
                
                int disp = (l.getCantidadActual() != null ? l.getCantidadActual() : 0)
                        - (l.getCantidadReservada() != null ? l.getCantidadReservada() : 0);
                if (disp > 0) {
                    lotesValidos.add(l);
                }
            }
            
            int stockTotalDisponible = lotesValidos.stream().mapToInt(l -> (l.getCantidadActual() != null ? l.getCantidadActual() : 0) - (l.getCantidadReservada() != null ? l.getCantidadReservada() : 0)).sum();

            if (stockTotalDisponible < cantidadSolicitada) {
                String nombreProd = lotesProducto.isEmpty() ? "Producto ID " + linea.getIdProducto() : lotesProducto.get(0).getProducto().getNombre();
                throw new IllegalStateException("Stock insuficiente para " + nombreProd
                    + ". Disponible: " + stockTotalDisponible + ", solicitado: " + cantidadSolicitada);
            }

            for (Lote lote : lotesValidos) {
                if (cantidadPorCubrir <= 0) break;
                
                int disponibleEnLote = (lote.getCantidadActual() != null ? lote.getCantidadActual() : 0)
                        - (lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0);
                
                int cantidadATomar = Math.min(disponibleEnLote, cantidadPorCubrir);
                
                BigDecimal precioUnitario = lote.getProducto().getPrecio();
                if (precioUnitario == null) {
                    throw new IllegalStateException("El lote " + lote.getNumeroLote() + " no tiene precio configurado");
                }
                
                BigDecimal descuentoPct = BigDecimal.ZERO;
                if (linea.getIdPromocion() != null) {
                    Promocion promo = promocionRepository.findById(linea.getIdPromocion())
                            .orElseThrow(() -> new EntityNotFoundException("Promoción no encontrada: " + linea.getIdPromocion()));
                    if (promo.getDescuentoGlobal() != null) descuentoPct = promo.getDescuentoGlobal();
                } else if (linea.getDescuentoPct() != null) {
                    descuentoPct = linea.getDescuentoPct();
                }
                
                BigDecimal precioLinea = precioUnitario.multiply(BigDecimal.valueOf(cantidadATomar));
                BigDecimal descuentoLinea = precioLinea.multiply(descuentoPct)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                BigDecimal subtotalLinea = precioLinea.subtract(descuentoLinea);
    
                subtotal = subtotal.add(precioLinea);
                descuentoTotal = descuentoTotal.add(descuentoLinea);
                
                // Generar sub-línea para este lote específico
                DetalleVentaIARequestDTO subLineaDto = DetalleVentaIARequestDTO.builder()
                        .idProducto(linea.getIdProducto())
                        .cantidad(cantidadATomar)
                        .esComboIA(linea.getEsComboIA())
                        .idPromocion(linea.getIdPromocion())
                        .descuentoPct(linea.getDescuentoPct())
                        .build();
                        
                lineasCalculadas.add(new LineaCalculada(subLineaDto, lote, precioUnitario, subtotalLinea));
                
                cantidadPorCubrir -= cantidadATomar;
            }
        }
        BigDecimal total = subtotal.subtract(descuentoTotal);

        String numeroOrden = "ORD-" + System.currentTimeMillis();

        // Tabla unificada operaciones.ventas: el técnico se guarda como Usuario
        // (no como TecnicoCampo), igual que en las ventas del POS.
        Venta venta = Venta.builder()
                .numeroComprobante(numeroOrden)
                .fecha(LocalDateTime.now())
                .cliente(cliente)
                .tecnico(tecnico.getUsuario())
                .subtotal(subtotal)
                .descuentoTotal(descuentoTotal)
                .ivaAplicado(BigDecimal.ZERO)
                .total(total)
                .estado(org.uteq.sacpa.util.EstadoVenta.CONFIRMADA.name())
                .build();

        for (LineaCalculada lc : lineasCalculadas) {
            Lote lote = lc.lote();

            Promocion promo = lc.dto().getIdPromocion() != null
                    ? promocionRepository.findById(lc.dto().getIdPromocion()).orElse(null)
                    : null;

            DetalleVenta detalle = DetalleVenta.builder()
                    .lote(lote)                          // trazabilidad FEFO / caducidad
                    .producto(lote.getProducto())         // denormalizado para reportes por producto
                    .cantidad(lc.dto().getCantidad())
                    .precioUnitario(lc.precioUnitario())
                    .subtotal(lc.subtotalLinea())
                    .esSugerenciaIa(Boolean.TRUE.equals(lc.dto().getEsComboIA()))
                    .promocion(promo)
                    .build();

            venta.agregarDetalle(detalle);

            // Descontar stock real del lote: recién aquí sale físicamente de bodega
            lote.setCantidadActual(lote.getCantidadActual() - lc.dto().getCantidad());
            loteRepository.save(lote);
        }

        Venta ventaCreada = ventaRepository.save(venta);
        return construirRespuesta(ventaCreada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaIAResponseDTO> misVentas(Integer idUsuarioAutenticado) {
        // La tabla unificada referencia al Usuario directamente, así que ya no hace
        // falta resolver el perfil TecnicoCampo para listar el historial.
        return ventaRepository.findTop100ByTecnico_IdUsuarioOrderByFechaDesc(idUsuarioAutenticado)
                .stream().map(this::construirRespuesta).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VentaIAResponseDTO obtenerVenta(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada: " + idVenta));
        return construirRespuesta(venta);
    }

    private VentaIAResponseDTO construirRespuesta(Venta venta) {
        List<DetalleVentaResponseDTO> lineas = detalleVentaRepository.findByVenta_Id(venta.getId())
                .stream().map(DetalleVentaResponseDTO::from).toList();

        // Resolver el nombre del técnico desde TecnicoCampo
        // (Usuario tiene @Transient en nombres/apellidos, siempre serían null)
        String nombreTecnico = null;
        if (venta.getTecnico() != null) {
            nombreTecnico = tecnicoCampoRepository.findByUsuario_IdUsuario(venta.getTecnico().getIdUsuario())
                    .map(tc -> tc.getNombres() + " " + tc.getApellidos())
                    .orElse(venta.getTecnico().getCorreo()); // fallback al correo
        }

        return VentaIAResponseDTO.from(venta, lineas, nombreTecnico);
    }

    private record LineaCalculada(DetalleVentaIARequestDTO dto, Lote lote, BigDecimal precioUnitario, BigDecimal subtotalLinea) {}
}
