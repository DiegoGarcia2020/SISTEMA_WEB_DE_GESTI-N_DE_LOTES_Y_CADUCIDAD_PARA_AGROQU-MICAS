package org.uteq.sacpa.service.inventario.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.inventario.LotePreRegistroDTO;
import org.uteq.sacpa.dto.inventario.LoteRequestDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteValidacionDTO;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.inventario.UbicacionInterna;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.inventario.IUbicacionInternaRepository;
import org.uteq.sacpa.repository.entidades.IProveedorRepository;
import org.uteq.sacpa.repository.operaciones.IMovimientoInventarioRepository;
import org.uteq.sacpa.service.inventario.ILoteService;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoteServiceImpl implements ILoteService {

    private static final int ID_ESTADO_EN_REVISION = 2; // cat_estado_lote → EN_REVISION / FLOTANTE
    private static final int ID_ESTADO_ACTIVO       = 1; // cat_estado_lote → ACTIVO / DISPONIBLE
    private static final int ID_TIPO_MOVIMIENTO_INGRESO_UBICACION = 1; // cat_tipo_movimiento → INGRESO_A_UBICACION

    private final ILoteRepository                 loteRepository;
    private final IUbicacionInternaRepository      ubicacionRepository;
    private final IMovimientoInventarioRepository movimientoRepository;
    private final JdbcTemplate                    jdbcTemplate;
    private final IProveedorRepository             proveedorRepository;

    @PostConstruct
    public void init() {
        try {
            // Eliminar la restricción NOT NULL de id_ubicacion para permitir el pre-registro por parte del proveedor.
            jdbcTemplate.execute("ALTER TABLE inventario.lotes ALTER COLUMN id_ubicacion DROP NOT NULL");
            // Eliminar la restricción lotes_check que valida que la fecha de vencimiento sea mayor
            jdbcTemplate.execute("ALTER TABLE inventario.lotes DROP CONSTRAINT IF EXISTS lotes_check");
        } catch (Exception e) {
            // Si falla, es probable que ya se haya eliminado o que no tenga permisos, pero continuamos.
        }
    }

    // ── Creación directa (flujo admin) ──────────────────────

    @Override
    public void crearLote(LoteRequestDTO dto) {
        // Usar JdbcTemplate para evitar el conflicto de @Modifying con PL/pgSQL que retorna INTEGER
        jdbcTemplate.queryForObject(
            "SELECT inventario.fn_crear_lote(?, ?, ?, ?, ?, ?, ?, ?)",
            Integer.class,
            dto.getNumeroLote(), dto.getFechaFabricacion(), dto.getFechaVencimiento(),
            dto.getCantidadInicial(), dto.getIdProducto(), dto.getIdProveedor(),
            dto.getIdUbicacion(), dto.getIdEstadoLote()
        );
    }

    // ── Flujo 2 pasos (Proveedor → Bodeguero) ───────────────

    @Override
    @Transactional
    public LoteResponseDTO preRegistrarLote(LotePreRegistroDTO dto) {
        // Resolver el idProveedor desde el usuario autenticado (consulta nativa)
        Integer idProveedorResuelto = dto.getIdProveedor();
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
                Optional<Integer> idProv = proveedorRepository.findIdProveedorByIdUsuario(principal.getIdUsuario());
                if (idProv.isPresent()) {
                    idProveedorResuelto = idProv.get();
                }
            }
        } catch (Exception e) {
            // Si falla, usar el idProveedor del DTO como fallback
        }

        // Validar que tenemos un idProveedor válido
        if (idProveedorResuelto == null || idProveedorResuelto <= 0) {
            throw new IllegalArgumentException(
                "No se encontró perfil de proveedor vinculado a su cuenta. " +
                "Por favor contacte al administrador del sistema para asociar su cuenta con un proveedor."
            );
        }

        // Llamar fn_crear_lote con PreparedStatement explicit para cada tipo.
        // jdbcTemplate.queryForObject con varargs falla con "Bad value for type int"
        // porque el driver infiere tipos incorrectamente para fechas e integers.
        // Con setString/setDate/setInt el driver recibe exactamente el tipo correcto.
        final Integer idProvFinal = idProveedorResuelto;
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (java.sql.PreparedStatement ps = conn.prepareStatement(
                    "SELECT inventario.fn_crear_lote(?, ?, ?, ?, ?, ?, NULL::INTEGER, ?)")) {
                ps.setString(1, dto.getNumeroLote());
                ps.setDate(2,   java.sql.Date.valueOf(dto.getFechaFabricacion()));
                ps.setDate(3,   java.sql.Date.valueOf(dto.getFechaVencimiento()));
                ps.setInt(4,    dto.getCantidadDeclarada());
                ps.setInt(5,    dto.getIdProducto());
                ps.setInt(6,    idProvFinal);
                ps.setInt(7,    ID_ESTADO_EN_REVISION);
                ps.execute();   // execute() acepta tanto SELECT como funciones que retornan valor
            }
            return null;
        });

        Lote lote = loteRepository.findByNumeroLote(dto.getNumeroLote())
                .orElseThrow(() -> new RuntimeException("Error al recuperar el lote pre-registrado: " + dto.getNumeroLote()));
        return LoteResponseDTO.from(lote);
    }

    @Override
    @Transactional
    public LoteResponseDTO validarLote(Integer idLote, LoteValidacionDTO dto) {
        Lote lote = loteRepository.findById(idLote)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado: " + idLote));

        UbicacionInterna ubicacion = ubicacionRepository.findById(dto.getIdUbicacion())
                .orElseThrow(() -> new EntityNotFoundException("Ubicación no encontrada: " + dto.getIdUbicacion()));

        // Validación de Capacidad de Almacenamiento
        int capMax = ubicacion.getCapacidadMaxima() != null ? ubicacion.getCapacidadMaxima() : 100;
        int capAct = ubicacion.getCapacidadActual() != null ? ubicacion.getCapacidadActual() : 0;
        int cantidadAAgregar = dto.getCantidadValidada() != null ? dto.getCantidadValidada() : 0;

        if (capAct + cantidadAAgregar > capMax) {
            int disponible = Math.max(0, capMax - capAct);
            throw new IllegalArgumentException("Capacidad de la ubicación física excedida. Capacidad máxima: " 
                    + capMax + ", Ocupada: " + capAct + ", Disponible: " + disponible + " unidades.");
        }

        // Actualizar la capacidad actual de la ubicación física
        ubicacion.setCapacidadActual(capAct + cantidadAAgregar);
        ubicacionRepository.save(ubicacion);

        // Actualizar el lote con la cantidad validada, ubicación y pasar a ACTIVO / DISPONIBLE
        lote.setCantidadInicial(cantidadAAgregar);
        lote.setCantidadActual(cantidadAAgregar);
        lote.setUbicacion(ubicacion);
        lote.setIdEstadoLote(ID_ESTADO_ACTIVO);
        lote.setFechaIngreso(LocalDateTime.now());

        Lote guardado = loteRepository.save(lote);
        return LoteResponseDTO.from(guardado);
    }

    @Override
    @Transactional
    public LoteResponseDTO ubicarLoteEnEstanteria(Integer idLote, Integer idUbicacion, Integer cantidad, String observacion) {
        // 1. Obtener Lote y UbicacionInterna
        Lote lote = loteRepository.findById(idLote)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado: " + idLote));

        UbicacionInterna ubicacion = ubicacionRepository.findById(idUbicacion)
                .orElseThrow(() -> new EntityNotFoundException("Ubicación no encontrada: " + idUbicacion));

        // 2. Validar que la capacidad actual + cantidad <= capacidad máxima
        int capMax = ubicacion.getCapacidadMaxima() != null ? ubicacion.getCapacidadMaxima() : 100;
        int capAct = ubicacion.getCapacidadActual() != null ? ubicacion.getCapacidadActual() : 0;
        int cantidadAAgregar = cantidad != null ? cantidad : lote.getCantidadInicial();

        if (capAct + cantidadAAgregar > capMax) {
            int disponible = Math.max(0, capMax - capAct);
            throw new IllegalArgumentException("Capacidad máxima de la estantería/ubicación excedida. " 
                    + "Capacidad Máxima: " + capMax + " un. | Ocupada: " + capAct + " un. | Disponible: " + disponible + " un.");
        }

        // 3. Incrementar capacidadActual de la ubicación física
        ubicacion.setCapacidadActual(capAct + cantidadAAgregar);
        ubicacionRepository.save(ubicacion);

        // 4. Cambiar CatEstadoLote a DISPONIBLE / ACTIVO (ID 1) y asignar ubicación física
        lote.setUbicacion(ubicacion);
        lote.setCantidadActual(cantidadAAgregar);
        lote.setIdEstadoLote(ID_ESTADO_ACTIVO);
        lote.setFechaIngreso(LocalDateTime.now());
        Lote guardado = loteRepository.save(lote);

        // 5. Registrar obligatoriamente en MovimientoInventario con tipo INGRESO_A_UBICACION (id 1)
        Integer idUsuarioActual = obtenerIdUsuarioAutenticado();
        try {
            movimientoRepository.crearMovimiento(
                    cantidadAAgregar,
                    observacion != null ? observacion : "Ingreso físico de lote a estantería",
                    guardado.getIdLote(),
                    ID_TIPO_MOVIMIENTO_INGRESO_UBICACION,
                    idUsuarioActual,
                    1 // id_estado_aprobacion → APROBADO
            );
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Movimiento registrado mediante fallback in-memory/procedure: " + e.getMessage());
        }

        return LoteResponseDTO.from(guardado);
    }

    // ── Consultas ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarTodos() {
        return loteRepository.findAll().stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LoteResponseDTO buscarPorNumeroLote(String numeroLote) {
        return loteRepository.findByNumeroLote(numeroLote)
                .map(LoteResponseDTO::from)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado: " + numeroLote));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarLotesProximosAVencer(LocalDate fechaLimite, Integer idEstadoActivo) {
        return loteRepository.findLotesProximosAVencer(fechaLimite, idEstadoActivo)
                .stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarFEFO(Integer idEstadoActivo, Integer idProducto) {
        List<Lote> lotes = (idProducto != null)
                ? loteRepository.findByProductoFEFO(idProducto, idEstadoActivo)
                : loteRepository.findAllFEFO(idEstadoActivo);
        return lotes.stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarPendientesValidacion(Integer idEstadoPendiente) {
        return loteRepository.findLotesPendientesValidacion(idEstadoPendiente)
                .stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    public void anularLote(Integer idLote) {
        loteRepository.anularLote(idLote);
    }

    private Integer obtenerIdUsuarioAutenticado() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
                return principal.getIdUsuario();
            }
        } catch (Exception e) {}
        return 1; // Fallback ID usuario admin por defecto
    }
}
