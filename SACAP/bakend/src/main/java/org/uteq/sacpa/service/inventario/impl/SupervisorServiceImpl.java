package org.uteq.sacpa.service.inventario.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.inventario.BodegueroDisponibleDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteSupervisorRequestDTO;
import org.uteq.sacpa.dto.inventario.MiBodegaDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.entity.inventario.Bodeguero;
import org.uteq.sacpa.entity.inventario.Categoria;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.inventario.Supervisor;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.entidades.IProveedorRepository;
import org.uteq.sacpa.repository.inventario.IAlmacenRepository;
import org.uteq.sacpa.repository.inventario.IBodegueroRepository;
import org.uteq.sacpa.repository.inventario.ICategoriaRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.repository.inventario.ISupervisorRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.inventario.ISupervisorService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupervisorServiceImpl implements ISupervisorService {

    private static final int ID_ESTADO_EN_REVISION = 2; // cat_estado_lote → EN_REVISION (pendiente de ubicación física)

    private final ISupervisorRepository supervisorRepository;
    private final IAlmacenRepository    almacenRepository;
    private final ILoteRepository       loteRepository;
    private final IProductoRepository   productoRepository;
    private final IProveedorRepository  proveedorRepository;
    private final ICategoriaRepository  categoriaRepository;
    private final IBodegueroRepository  bodegueroRepository;
    private final IUsuarioRepository    usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MiBodegaDTO> misBodegas(Integer idUsuarioAutenticado) {
        return almacenRepository.findBySupervisor_Usuario_IdUsuario(idUsuarioAutenticado)
                .stream().map(MiBodegaDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> misLotes(Integer idUsuarioAutenticado, Integer idAlmacen, Integer idCategoria) {
        validarBodegaDelSupervisor(idUsuarioAutenticado, idAlmacen);

        List<Lote> lotes = (idCategoria != null)
                ? loteRepository.findByAlmacenYCategoria(idAlmacen, idCategoria)
                : loteRepository.findByAlmacen(idAlmacen);

        return lotes.stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    @Transactional
    public LoteResponseDTO crearLote(Integer idUsuarioAutenticado, LoteSupervisorRequestDTO dto) {
        Almacen almacen = validarBodegaDelSupervisor(idUsuarioAutenticado, dto.getIdAlmacen());

        Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + dto.getIdProducto()));

        Proveedor proveedor = proveedorRepository.findById(dto.getIdProveedor())
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado: " + dto.getIdProveedor()));

        Lote lote = Lote.builder()
                .numeroLote(dto.getNumeroLote())
                .fechaFabricacion(dto.getFechaFabricacion())
                .fechaVencimiento(dto.getFechaVencimiento())
                .cantidadInicial(dto.getCantidad())
                .cantidadActual(dto.getCantidad())
                .fechaIngreso(LocalDateTime.now())
                .idEstadoLote(ID_ESTADO_EN_REVISION)
                .producto(producto)
                .proveedor(proveedor)
                .almacen(almacen)
                .build();

        Lote guardado = loteRepository.save(lote);
        return LoteResponseDTO.from(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> categoriasActivas() {
        return categoriaRepository.findAll().stream()
                .filter(c -> c.getIdEstado() == null || c.getIdEstado() == 1)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BodegueroDisponibleDTO> bodeguerosDeMiBodega(Integer idUsuarioAutenticado, Integer idAlmacen) {
        validarBodegaDelSupervisor(idUsuarioAutenticado, idAlmacen);
        return bodegueroRepository.findByAlmacen_IdAlmacen(idAlmacen).stream()
                .map(this::toDisponibleDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BodegueroDisponibleDTO> bodeguerosDisponibles(Integer idUsuarioAutenticado) {
        return usuarioRepository.findUsuariosConRolBodeguero().stream()
                .map(u -> {
                    Bodeguero b = bodegueroRepository.findByUsuario_IdUsuario(u.getIdUsuario()).orElse(null);
                    return toDisponibleDTO(u, b);
                })
                .toList();
    }

    @Override
    @Transactional
    public BodegueroDisponibleDTO asignarBodeguero(Integer idUsuarioAutenticado, Integer idAlmacen, Integer idUsuarioBodeguero) {
        Almacen almacen = validarBodegaDelSupervisor(idUsuarioAutenticado, idAlmacen);
        Usuario usuarioBodeguero = usuarioRepository.findById(idUsuarioBodeguero)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + idUsuarioBodeguero));

        boolean tieneRolBodeguero = usuarioBodeguero.getRoles() != null && usuarioBodeguero.getRoles().stream()
                .anyMatch(ur -> ur.getRol() != null && ur.getRol().getNombre() != null
                        && ur.getRol().getNombre().toLowerCase().contains("bodegu"));
        if (!tieneRolBodeguero) {
            throw new IllegalArgumentException("El usuario " + idUsuarioBodeguero + " no tiene el rol Bodeguero");
        }

        Bodeguero bodeguero = bodegueroRepository.findByUsuario_IdUsuario(idUsuarioBodeguero)
                .orElseGet(() -> Bodeguero.builder()
                        .cedula(usuarioBodeguero.getCedula() != null ? usuarioBodeguero.getCedula() : "CED-" + idUsuarioBodeguero)
                        .nombres(usuarioBodeguero.getNombres() != null ? usuarioBodeguero.getNombres() : "Bodeguero")
                        .apellidos(usuarioBodeguero.getApellidos() != null ? usuarioBodeguero.getApellidos() : "SACPA")
                        .telefono(usuarioBodeguero.getTelefono())
                        .idEstado(1)
                        .usuario(usuarioBodeguero)
                        .build());

        bodeguero.setAlmacen(almacen);
        Bodeguero guardado = bodegueroRepository.save(bodeguero);
        return toDisponibleDTO(guardado);
    }

    @Override
    @Transactional
    public void quitarBodeguero(Integer idUsuarioAutenticado, Integer idAlmacen, Integer idUsuarioBodeguero) {
        validarBodegaDelSupervisor(idUsuarioAutenticado, idAlmacen);
        Bodeguero bodeguero = bodegueroRepository.findByUsuario_IdUsuario(idUsuarioBodeguero)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró perfil de Bodeguero para el usuario " + idUsuarioBodeguero));

        if (bodeguero.getAlmacen() == null || !bodeguero.getAlmacen().getIdAlmacen().equals(idAlmacen)) {
            throw new IllegalArgumentException("Este bodeguero no está asignado a la bodega " + idAlmacen);
        }

        bodeguero.setAlmacen(null);
        bodegueroRepository.save(bodeguero);
    }

    private BodegueroDisponibleDTO toDisponibleDTO(Bodeguero b) {
        return toDisponibleDTO(b.getUsuario(), b);
    }

    private BodegueroDisponibleDTO toDisponibleDTO(Usuario u, Bodeguero b) {
        return BodegueroDisponibleDTO.builder()
                .idUsuario(u.getIdUsuario())
                .correo(u.getCorreo())
                .nombres(b != null && b.getNombres() != null ? b.getNombres() : u.getNombres())
                .apellidos(b != null && b.getApellidos() != null ? b.getApellidos() : u.getApellidos())
                .telefono(b != null && b.getTelefono() != null ? b.getTelefono() : u.getTelefono())
                .idAlmacenAsignado(b != null && b.getAlmacen() != null ? b.getAlmacen().getIdAlmacen() : null)
                .nombreAlmacenAsignado(b != null && b.getAlmacen() != null ? b.getAlmacen().getNombre() : null)
                .build();
    }

    /** Resuelve el supervisor del usuario autenticado y valida que la bodega le pertenezca. */
    private Almacen validarBodegaDelSupervisor(Integer idUsuarioAutenticado, Integer idAlmacen) {
        Supervisor supervisor = supervisorRepository.findByUsuario_IdUsuario(idUsuarioAutenticado)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No se encontró perfil de Supervisor vinculado a este usuario"));

        Almacen almacen = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new EntityNotFoundException("Bodega no encontrada: " + idAlmacen));

        if (almacen.getSupervisor() == null
                || !almacen.getSupervisor().getIdSupervisor().equals(supervisor.getIdSupervisor())) {
            throw new IllegalArgumentException("La bodega " + idAlmacen + " no está asignada a este supervisor");
        }
        return almacen;
    }
}
