package org.uteq.sacpa.service.operaciones.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;
import org.uteq.sacpa.dto.ia_modelos.TemporadaResponseDTO;
import org.uteq.sacpa.dto.operaciones.DetalleVentaRequestDTO;
import org.uteq.sacpa.dto.operaciones.DetalleVentaResponseDTO;
import org.uteq.sacpa.dto.operaciones.VentaCreateRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaDashboardResponseDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;
import org.uteq.sacpa.entity.catalogos.CatCultivo;
import org.uteq.sacpa.entity.catalogos.CatEstadoPromocion;
import org.uteq.sacpa.entity.catalogos.CatEstadoTemporada;
import org.uteq.sacpa.entity.catalogos.CatEstadoVenta;
import org.uteq.sacpa.entity.catalogos.CatPlaga;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.entity.ia_alertas.Promocion;
import org.uteq.sacpa.entity.inventario.Categoria;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.operaciones.TecnicoCampo;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.repository.catalogos.ICatCultivoRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoPromocionRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoTemporadaRepository;
import org.uteq.sacpa.repository.catalogos.ICatEstadoVentaRepository;
import org.uteq.sacpa.repository.catalogos.ICatPlagaRepository;
import org.uteq.sacpa.repository.entidades.IClienteRepository;
import org.uteq.sacpa.repository.ia_alertas.IPromocionRepository;
import org.uteq.sacpa.repository.ia_alertas.ITemporadaAgricolaRepository;
import org.uteq.sacpa.repository.inventario.ICategoriaRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.operaciones.IDetalleVentaRepository;
import org.uteq.sacpa.repository.operaciones.ITecnicoCampoRepository;
import org.uteq.sacpa.repository.operaciones.IVentaRepository;
import org.uteq.sacpa.service.ia_alertas.IMotorSugerenciaIAService;
import org.uteq.sacpa.service.operaciones.IVentaService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class VentaServiceImpl implements IVentaService {

    private final ITecnicoCampoRepository tecnicoCampoRepository;
    private final IClienteRepository clienteRepository;
    private final ILoteRepository loteRepository;
    private final IVentaRepository ventaRepository;
    private final IDetalleVentaRepository detalleVentaRepository;
    private final ICatEstadoVentaRepository catEstadoVentaRepository;
    private final ITemporadaAgricolaRepository temporadaRepository;
    private final ICatEstadoTemporadaRepository catEstadoTemporadaRepository;
    private final IPromocionRepository promocionRepository;
    private final ICatEstadoPromocionRepository catEstadoPromocionRepository;
    private final IMotorSugerenciaIAService motorSugerenciaIAService;
    private final ICategoriaRepository categoriaRepository;
    private final ICatCultivoRepository catCultivoRepository;
    private final ICatPlagaRepository catPlagaRepository;
    private final JdbcTemplate jdbcTemplate;

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
                .map(promocionRepository::findByEstado_IdEstadoPromocion)
                .orElse(List.of())
                .stream().map(PromocionResponseDTO::from).toList();

        int cantidadHoy = 0;
        BigDecimal totalHoy = BigDecimal.ZERO;
        var tecnicoOpt = tecnicoCampoRepository.findByUsuario_IdUsuario(idUsuarioAutenticado);
        if (tecnicoOpt.isPresent()) {
            LocalDate hoy = LocalDate.now();
            List<Venta> ventasHoy = ventaRepository.findByTecnico_IdTecnicoOrderByFechaVentaDesc(tecnicoOpt.get().getIdTecnico())
                    .stream()
                    .filter(v -> v.getFechaVenta() != null && v.getFechaVenta().toLocalDate().equals(hoy))
                    .toList();
            cantidadHoy = ventasHoy.size();
            totalHoy = ventasHoy.stream().map(Venta::getTotal).filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

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
    @Transactional
    public VentaResponseDTO crearVenta(Integer idUsuarioAutenticado, VentaCreateRequestDTO dto) {
        TecnicoCampo tecnico = tecnicoCampoRepository.findByUsuario_IdUsuario(idUsuarioAutenticado)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró perfil de Técnico de Campo para este usuario"));

        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + dto.getIdCliente()));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal descuentoTotal = BigDecimal.ZERO;
        List<LineaCalculada> lineasCalculadas = new ArrayList<>();

        for (DetalleVentaRequestDTO linea : dto.getLineas()) {
            Lote lote = loteRepository.findById(linea.getIdLote())
                    .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado: " + linea.getIdLote()));
            if (lote.getProducto() == null || lote.getProducto().getPrecio() == null) {
                throw new IllegalStateException("El lote " + lote.getNumeroLote() + " no tiene precio configurado");
            }

            BigDecimal precioUnitario = lote.getProducto().getPrecio();
            BigDecimal descuentoPct = BigDecimal.ZERO;
            if (linea.getIdPromocion() != null) {
                Promocion promo = promocionRepository.findById(linea.getIdPromocion())
                        .orElseThrow(() -> new EntityNotFoundException("Promoción no encontrada: " + linea.getIdPromocion()));
                if (promo.getDescuentoGlobal() != null) descuentoPct = promo.getDescuentoGlobal();
            } else if (linea.getDescuentoPct() != null) {
                // Sin Promoción formal: se honra el descuento sugerido por el Motor de Sugerencias IA
                descuentoPct = linea.getDescuentoPct();
            }

            BigDecimal precioLinea = precioUnitario.multiply(BigDecimal.valueOf(linea.getCantidad()));
            BigDecimal descuentoLinea = precioLinea.multiply(descuentoPct)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            BigDecimal subtotalLinea = precioLinea.subtract(descuentoLinea);

            subtotal = subtotal.add(precioLinea);
            descuentoTotal = descuentoTotal.add(descuentoLinea);
            lineasCalculadas.add(new LineaCalculada(linea, precioUnitario, subtotalLinea));
        }
        BigDecimal total = subtotal.subtract(descuentoTotal);

        Integer idPendienteDespacho = catEstadoVentaRepository.findByNombreIgnoreCase("PENDIENTE_DESPACHO")
                .map(CatEstadoVenta::getIdEstadoVenta)
                .orElseThrow(() -> new IllegalStateException("No existe el estado PENDIENTE_DESPACHO en el catálogo"));

        String numeroOrden = "ORD-" + System.currentTimeMillis();
        crearVentaJdbc(numeroOrden, cliente.getIdCliente(), tecnico.getIdTecnico(), subtotal, descuentoTotal, total, idPendienteDespacho);
        Venta ventaCreada = ventaRepository.findByNumeroOrden(numeroOrden)
                .orElseThrow(() -> new IllegalStateException("Error al recuperar la venta recién creada: " + numeroOrden));

        for (LineaCalculada lc : lineasCalculadas) {
            crearDetalleVentaJdbc(
                    ventaCreada.getIdVenta(), lc.dto().getIdLote(), lc.dto().getCantidad(), lc.precioUnitario(), lc.subtotalLinea(),
                    lc.dto().getEsComboIA() != null ? lc.dto().getEsComboIA() : Boolean.FALSE, lc.dto().getIdPromocion()
            );
        }

        return construirRespuesta(ventaCreada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaResponseDTO> misVentas(Integer idUsuarioAutenticado) {
        TecnicoCampo tecnico = tecnicoCampoRepository.findByUsuario_IdUsuario(idUsuarioAutenticado)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró perfil de Técnico de Campo para este usuario"));
        return ventaRepository.findByTecnico_IdTecnicoOrderByFechaVentaDesc(tecnico.getIdTecnico())
                .stream().map(this::construirRespuesta).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VentaResponseDTO obtenerVenta(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada: " + idVenta));
        return construirRespuesta(venta);
    }

    private VentaResponseDTO construirRespuesta(Venta venta) {
        List<DetalleVentaResponseDTO> lineas = detalleVentaRepository.findByVenta_IdVenta(venta.getIdVenta())
                .stream().map(DetalleVentaResponseDTO::from).toList();
        return VentaResponseDTO.from(venta, lineas);
    }

    // Vía JdbcTemplate: "SELECT fn(...)" con executeUpdate() (usado por @Modifying) falla en Postgres
    // para funciones que retornan void — ver LoteServiceImpl.preRegistrarLote para el mismo patrón.
    private void crearVentaJdbc(String numeroOrden, Integer idCliente, Integer idTecnico, BigDecimal subtotal,
                                 BigDecimal descuentoTotal, BigDecimal total, Integer idEstado) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.PreparedStatement ps = conn.prepareStatement(
                    "SELECT operaciones.fn_crear_venta(?, ?, ?, ?, ?, ?, ?)")) {
                ps.setString(1, numeroOrden);
                ps.setInt(2, idCliente);
                ps.setInt(3, idTecnico);
                ps.setBigDecimal(4, subtotal);
                ps.setBigDecimal(5, descuentoTotal);
                ps.setBigDecimal(6, total);
                ps.setInt(7, idEstado);
                ps.execute();
            }
            return null;
        });
    }

    private void crearDetalleVentaJdbc(Integer idVenta, Integer idLote, Integer cantidad, BigDecimal precioUnitario,
                                        BigDecimal subtotalLinea, Boolean esComboIA, Integer idPromocion) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.PreparedStatement ps = conn.prepareStatement(
                    "SELECT operaciones.fn_crear_detalle_venta(?, ?, ?, ?, ?, ?, ?)")) {
                ps.setInt(1, idVenta);
                ps.setInt(2, idLote);
                ps.setInt(3, cantidad);
                ps.setBigDecimal(4, precioUnitario);
                ps.setBigDecimal(5, subtotalLinea);
                ps.setBoolean(6, Boolean.TRUE.equals(esComboIA));
                if (idPromocion != null) ps.setInt(7, idPromocion); else ps.setNull(7, java.sql.Types.INTEGER);
                ps.execute();
            }
            return null;
        });
    }

    private record LineaCalculada(DetalleVentaRequestDTO dto, BigDecimal precioUnitario, BigDecimal subtotalLinea) {}
}
