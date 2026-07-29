package org.uteq.sacpa.service.inventario.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteSupervisorRequestDTO;
import org.uteq.sacpa.dto.inventario.MiBodegaDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.entity.inventario.Categoria;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.inventario.Supervisor;
import org.uteq.sacpa.repository.entidades.IProveedorRepository;
import org.uteq.sacpa.repository.inventario.IAlmacenRepository;
import org.uteq.sacpa.repository.inventario.ICategoriaRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.repository.inventario.ISupervisorRepository;
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
