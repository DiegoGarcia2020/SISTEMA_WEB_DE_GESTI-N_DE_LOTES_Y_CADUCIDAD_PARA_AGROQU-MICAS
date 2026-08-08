package org.uteq.sacpa.service.entidades.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.entidades.ProveedorRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.repository.entidades.IProveedorRepository;
import org.uteq.sacpa.service.entidades.IProveedorService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Service
public class ProveedorServiceImpl implements IProveedorService {

    @Autowired
    private IProveedorRepository proveedorRepository;

    @Autowired
    private org.uteq.sacpa.repository.entidades.IProveedorProductoRepository proveedorProductoRepository;

    @Autowired
    private org.uteq.sacpa.repository.inventario.IProductoRepository productoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void crearProveedor(ProveedorRequestDTO dto) {
        if (proveedorRepository.existsByRuc(dto.getRuc())) {
            throw new RuntimeException("El RUC ya está registrado.");
        }

        // Se usa JdbcTemplate + PreparedStatement.execute() en vez de @Modifying/nativeQuery:
        // fn_crear_proveedor RETURNS void, y Postgres siempre devuelve una fila al hacer
        // SELECT funcion(), lo que rompe executeUpdate() con "Se retornó un resultado
        // cuando no se esperaba ninguno".
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT entidades.fn_crear_proveedor(?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
                ps.setInt(1, dto.getIdEstado());
                ps.setString(2, dto.getRuc());
                ps.setString(3, dto.getNombreRepresentante());
                ps.setString(4, dto.getDireccion());
                ps.setString(5, null); // telefono, si lo añades al DTO en el futuro
                ps.setString(6, dto.getTelefonoEmpresa());
                ps.setString(7, dto.getCorreoContacto());
                ps.setInt(8, dto.getIdEmpresa());
                ps.setInt(9, dto.getIdCiudad());
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @Transactional
    public void actualizarProveedor(Integer id, ProveedorRequestDTO dto) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT entidades.fn_actualizar_proveedor(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
                ps.setInt(1, id);
                ps.setInt(2, dto.getIdEstado());
                ps.setString(3, dto.getRuc());
                ps.setString(4, dto.getNombreRepresentante());
                ps.setString(5, dto.getDireccion());
                ps.setString(6, null); // telefono
                ps.setString(7, dto.getTelefonoEmpresa());
                ps.setString(8, dto.getCorreoContacto());
                ps.setInt(9, dto.getIdEmpresa());
                ps.setInt(10, dto.getIdCiudad());
                ps.execute();
            }
            return null;
        });
    }

    @Override
    public Proveedor obtenerPorId(Integer id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
    }

    @Override
    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    @Override
    @Transactional
    public void eliminarProveedor(Integer idProveedor) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT entidades.fn_eliminar_proveedor(?)")) {
                ps.setInt(1, idProveedor);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    public void asociarProducto(org.uteq.sacpa.dto.entidades.ProveedorProductoDTO dto) {
        Proveedor proveedor = proveedorRepository.findById(dto.getIdProveedor())
            .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        org.uteq.sacpa.entity.inventario.Producto producto = productoRepository.findById(dto.getIdProducto())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (proveedorProductoRepository.existsByProveedor_IdProveedorAndProducto_IdProducto(dto.getIdProveedor(), dto.getIdProducto())) {
            throw new RuntimeException("El producto ya está asociado al proveedor");
        }

        org.uteq.sacpa.entity.entidades.ProveedorProducto pp = new org.uteq.sacpa.entity.entidades.ProveedorProducto();
        pp.setProveedor(proveedor);
        pp.setProducto(producto);
        pp.setPrecioReferencial(dto.getPrecioReferencial());
        pp.setCodigoProductoProveedor(dto.getCodigoProductoProveedor());
        pp.setIdEstado(dto.getIdEstado() != null ? dto.getIdEstado() : 1);

        proveedorProductoRepository.save(pp);
    }

    @Override
    public void desasociarProducto(Integer idProveedor, Integer idProducto) {
        org.uteq.sacpa.entity.entidades.ProveedorProducto pp = proveedorProductoRepository.findByProveedor_IdProveedorAndProducto_IdProducto(idProveedor, idProducto)
            .orElseThrow(() -> new RuntimeException("Asociación no encontrada"));
        proveedorProductoRepository.delete(pp);
    }

    @Override
    public List<org.uteq.sacpa.dto.entidades.ProveedorProductoDTO> listarProductosDeProveedor(Integer idProveedor) {
        List<org.uteq.sacpa.entity.entidades.ProveedorProducto> lista = proveedorProductoRepository.findByProveedor_IdProveedor(idProveedor);
        return lista.stream().map(pp -> org.uteq.sacpa.dto.entidades.ProveedorProductoDTO.builder()
            .idProveedorProducto(pp.getIdProveedorProducto())
            .idProveedor(pp.getProveedor().getIdProveedor())
            .idProducto(pp.getProducto().getIdProducto())
            .precioReferencial(pp.getPrecioReferencial())
            .codigoProductoProveedor(pp.getCodigoProductoProveedor())
            .idEstado(pp.getIdEstado())
            .nombreProducto(pp.getProducto().getNombre())
            .unidadMedida(pp.getProducto().getUnidadMedida())
            .build()).toList();
    }

    @Override
    public Optional<Proveedor> buscarPorIdUsuario(Integer idUsuario) {
        // Usar consulta nativa para evitar problemas con nombres de columnas
        Optional<Integer> idProv = proveedorRepository.findIdProveedorByIdUsuario(idUsuario);
        return idProv.flatMap(id -> proveedorRepository.findById(id));
    }
}
