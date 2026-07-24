package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.operaciones.DetalleCompraRequestDTO;
import org.uteq.sacpa.dto.operaciones.OrdenCompraRequestDTO;
import org.uteq.sacpa.dto.operaciones.OrdenCompraResponseDTO;
import org.uteq.sacpa.dto.operaciones.RecepcionLoteRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.operaciones.DetalleCompra;
import org.uteq.sacpa.entity.operaciones.OrdenCompra;
import org.uteq.sacpa.repository.entidades.IProveedorRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.repository.operaciones.IDetalleCompraRepository;
import org.uteq.sacpa.repository.operaciones.IOrdenCompraRepository;
import org.uteq.sacpa.service.operaciones.IOrdenCompraService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de Órdenes de Compra.
 * Contiene la lógica de negocio financiera:
 *
 * 1. Cálculo de descuentos por ítem
 * 2. Manejo de bonificaciones (regalos del proveedor)
 * 3. Cálculo del costo promedio real para lotes con bonificaciones
 * 4. Generación de lotes FLOTANTES en la recepción
 */
@Service
public class OrdenCompraServiceImpl implements IOrdenCompraService {

    /** Estado para lotes recién ingresados sin ubicación física. Ajustar según catálogo existente */
    private static final Integer ESTADO_LOTE_FLOTANTE = 5;

    @Autowired
    private IOrdenCompraRepository ordenCompraRepository;

    @Autowired
    private IDetalleCompraRepository detalleCompraRepository;

    @Autowired
    private IProductoRepository productoRepository;

    @Autowired
    private IProveedorRepository proveedorRepository;

    @Autowired
    private ILoteRepository loteRepository;

    // =========================================================================
    // CREAR ORDEN DE COMPRA
    // =========================================================================

    @Override
    @Transactional
    public OrdenCompra crearOrdenCompra(OrdenCompraRequestDTO dto) {

        // 1. Validar proveedor
        Proveedor proveedor = proveedorRepository.findById(dto.getIdProveedor())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + dto.getIdProveedor()));

        // 2. Construir cabecera
        OrdenCompra orden = OrdenCompra.builder()
                .proveedor(proveedor)
                .numeroFactura(dto.getNumeroFactura())
                .fechaEmision(dto.getFechaEmision())
                .costoTransporte(dto.getCostoTransporte() != null ? dto.getCostoTransporte() : BigDecimal.ZERO)
                .impuestos(dto.getImpuestos() != null ? dto.getImpuestos() : BigDecimal.ZERO)
                .estado("PENDIENTE")
                .fechaRegistro(LocalDateTime.now())
                .detalles(new ArrayList<>())
                .build();

        // 3. Acumuladores financieros
        BigDecimal subtotalBruto = BigDecimal.ZERO;
        BigDecimal totalDescuentos = BigDecimal.ZERO;

        // 4. Procesar cada detalle
        for (DetalleCompraRequestDTO detalleDTO : dto.getDetalles()) {

            // Validar producto
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + detalleDTO.getIdProducto()));

            boolean esBonificacion = Boolean.TRUE.equals(detalleDTO.getEsBonificacion());
            BigDecimal precioUnitario = esBonificacion ? BigDecimal.ZERO : detalleDTO.getPrecioUnitario();
            BigDecimal porcentajeDescuento = detalleDTO.getPorcentajeDescuento() != null
                    ? detalleDTO.getPorcentajeDescuento()
                    : BigDecimal.ZERO;

            // Calcular valor del descuento en dólares
            BigDecimal montoSinDescuento = precioUnitario.multiply(BigDecimal.valueOf(detalleDTO.getCantidad()));
            BigDecimal valorDescuento = montoSinDescuento
                    .multiply(porcentajeDescuento)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Subtotal del ítem = (Cant * Precio) - Descuento
            BigDecimal subtotalItem = montoSinDescuento.subtract(valorDescuento);

            DetalleCompra detalle = DetalleCompra.builder()
                    .producto(producto)
                    .cantidad(detalleDTO.getCantidad())
                    .precioUnitario(precioUnitario)
                    .porcentajeDescuento(porcentajeDescuento)
                    .valorDescuento(valorDescuento)
                    .subtotal(subtotalItem)
                    .esBonificacion(esBonificacion)
                    .build();

            orden.agregarDetalle(detalle);

            // Acumular solo ítems NO bonificación
            if (!esBonificacion) {
                subtotalBruto = subtotalBruto.add(montoSinDescuento);
                totalDescuentos = totalDescuentos.add(valorDescuento);
            }
        }

        // 5. Calcular totales de cabecera
        orden.setSubtotalBruto(subtotalBruto);
        orden.setTotalDescuentos(totalDescuentos);

        // Total neto = Subtotal bruto - Descuentos + Transporte + Impuestos
        BigDecimal totalNeto = subtotalBruto
                .subtract(totalDescuentos)
                .add(orden.getCostoTransporte())
                .add(orden.getImpuestos());
        orden.setTotalNeto(totalNeto);

        // 6. Guardar en cascada (cabecera + detalles)
        return ordenCompraRepository.save(orden);
    }

    // =========================================================================
    // LISTAR ÓRDENES (CON FILTROS OPCIONALES)
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<OrdenCompraResponseDTO> listarOrdenes(String estado, Integer idProveedor,
                                                       LocalDate desde, LocalDate hasta) {
        List<OrdenCompra> ordenes = ordenCompraRepository.findByFiltros(estado, idProveedor, desde, hasta);
        return ordenes.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    // =========================================================================
    // OBTENER ORDEN POR ID
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public OrdenCompraResponseDTO obtenerPorId(Integer id) {
        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de compra no encontrada con ID: " + id));
        return mapToResponseDTO(orden);
    }

    // =========================================================================
    // RECEPCIONAR ORDEN → GENERAR LOTES FLOTANTES + COSTO PROMEDIO
    // =========================================================================

    @Override
    @Transactional
    public void recepcionarOrden(RecepcionLoteRequestDTO dto) {

        // 1. Cargar la orden y validar estado
        OrdenCompra orden = ordenCompraRepository.findById(dto.getIdOrdenCompra())
                .orElseThrow(() -> new RuntimeException("Orden de compra no encontrada con ID: " + dto.getIdOrdenCompra()));

        if (!"PENDIENTE".equals(orden.getEstado())) {
            throw new RuntimeException("Solo se pueden recepcionar órdenes en estado PENDIENTE. Estado actual: " + orden.getEstado());
        }

        // 2. Cargar detalles con productos
        List<DetalleCompra> detalles = detalleCompraRepository.findByOrdenCompraId(orden.getId());

        // 3. Calcular COSTO REAL PROMEDIO (Regla de Negocio Financiera)
        // totalPagado = Σ subtotales de ítems NO bonificación + costo transporte
        BigDecimal totalPagado = detalles.stream()
                .filter(d -> !Boolean.TRUE.equals(d.getEsBonificacion()))
                .map(DetalleCompra::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(orden.getCostoTransporte() != null ? orden.getCostoTransporte() : BigDecimal.ZERO);

        // totalUnidades = Σ cantidades de TODOS los ítems (incluye bonificaciones)
        int totalUnidades = detalles.stream()
                .mapToInt(DetalleCompra::getCantidad)
                .sum();

        // Costo unitario real = totalPagado / totalUnidades
        // Ej: 100 productos a $10 + 10 regalados = $1000 / 110 = $9.09
        BigDecimal costoUnitarioReal = totalUnidades > 0
                ? totalPagado.divide(BigDecimal.valueOf(totalUnidades), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 4. Crear mapa de detalles por ID para buscar rápidamente
        Map<Integer, DetalleCompra> detalleMap = detalles.stream()
                .collect(Collectors.toMap(DetalleCompra::getId, d -> d));

        // 5. Por cada lote recibido, crear la entidad Lote en estado FLOTANTE
        for (RecepcionLoteRequestDTO.LoteRecepcionItemDTO loteDTO : dto.getLotes()) {

            DetalleCompra detalle = detalleMap.get(loteDTO.getIdDetalleCompra());
            if (detalle == null) {
                throw new RuntimeException("Detalle de compra no encontrado con ID: " + loteDTO.getIdDetalleCompra());
            }

            Lote lote = Lote.builder()
                    .numeroLote(loteDTO.getNumeroLote())
                    .fechaFabricacion(loteDTO.getFechaFabricacion())
                    .fechaVencimiento(loteDTO.getFechaVencimiento())
                    .cantidadInicial(detalle.getCantidad())
                    .cantidadActual(detalle.getCantidad())
                    .cantidadReservada(0)
                    .fechaIngreso(LocalDateTime.now())
                    .idEstadoLote(ESTADO_LOTE_FLOTANTE)
                    .costoUnitarioReal(costoUnitarioReal)
                    .producto(detalle.getProducto())
                    .proveedor(orden.getProveedor())
                    .ordenCompra(orden)
                    .build();

            loteRepository.save(lote);
        }

        // 6. Cambiar estado de la orden a RECEPCIONADA
        orden.setEstado("RECEPCIONADA");
        ordenCompraRepository.save(orden);
    }

    // =========================================================================
    // ANULAR ORDEN
    // =========================================================================

    @Override
    @Transactional
    public void anularOrden(Integer id) {
        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de compra no encontrada con ID: " + id));

        if (!"PENDIENTE".equals(orden.getEstado())) {
            throw new RuntimeException("Solo se pueden anular órdenes en estado PENDIENTE. Estado actual: " + orden.getEstado());
        }

        orden.setEstado("ANULADA");
        ordenCompraRepository.save(orden);
    }

    // =========================================================================
    // MEMORIA DE PRECIOS
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public BigDecimal obtenerUltimoPrecioProducto(Integer idProducto) {
        return ordenCompraRepository.findUltimoPrecioProducto(idProducto).orElse(null);
    }

    // =========================================================================
    // HELPER: Mapeo Entidad → ResponseDTO
    // =========================================================================

    private OrdenCompraResponseDTO mapToResponseDTO(OrdenCompra orden) {
        List<OrdenCompraResponseDTO.DetalleCompraResponseDTO> detallesDTO = new ArrayList<>();

        if (orden.getDetalles() != null) {
            for (DetalleCompra d : orden.getDetalles()) {
                detallesDTO.add(OrdenCompraResponseDTO.DetalleCompraResponseDTO.builder()
                        .id(d.getId())
                        .idProducto(d.getProducto() != null ? d.getProducto().getIdProducto() : null)
                        .nombreProducto(d.getProducto() != null ? d.getProducto().getNombre() : "Producto desconocido")
                        .unidadMedida(d.getProducto() != null ? d.getProducto().getUnidadMedida() : "")
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .porcentajeDescuento(d.getPorcentajeDescuento())
                        .valorDescuento(d.getValorDescuento())
                        .subtotal(d.getSubtotal())
                        .esBonificacion(d.getEsBonificacion())
                        .build());
            }
        }

        return OrdenCompraResponseDTO.builder()
                .id(orden.getId())
                .idProveedor(orden.getProveedor() != null ? orden.getProveedor().getIdProveedor() : null)
                .nombreProveedor(orden.getProveedor() != null ? orden.getProveedor().getNombre() : "Proveedor desconocido")
                .numeroFactura(orden.getNumeroFactura())
                .fechaEmision(orden.getFechaEmision())
                .subtotalBruto(orden.getSubtotalBruto())
                .totalDescuentos(orden.getTotalDescuentos())
                .costoTransporte(orden.getCostoTransporte())
                .impuestos(orden.getImpuestos())
                .totalNeto(orden.getTotalNeto())
                .estado(orden.getEstado())
                .fechaRegistro(orden.getFechaRegistro())
                .detalles(detallesDTO)
                .build();
    }
}
