package org.uteq.sacpa.service.entidades.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.entidades.ProveedorRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.repository.entidades.IProveedorRepository;
import org.uteq.sacpa.service.entidades.IProveedorService;

import java.util.List;

@Service
public class ProveedorServiceImpl implements IProveedorService {

    @Autowired
    private IProveedorRepository proveedorRepository;

    @Autowired
    private org.uteq.sacpa.repository.entidades.IProveedorProductoRepository proveedorProductoRepository;

    @Autowired
    private org.uteq.sacpa.repository.inventario.IProductoRepository productoRepository;

    @Override
    public void crearProveedor(ProveedorRequestDTO dto) {
        if (proveedorRepository.existsByRuc(dto.getRuc())) {
            throw new RuntimeException("El RUC ya está registrado.");
        }
        
        proveedorRepository.crearProveedor(
                dto.getIdEstado(),
                dto.getRuc(),
                dto.getNombreRepresentante(),
                dto.getDireccion(),
                null, // telefono, si lo añades al DTO en el futuro
                dto.getTelefonoEmpresa(),
                dto.getCorreoContacto(),
                dto.getIdEmpresa(),
                dto.getIdCiudad()
        );
    }

    @Override
    public void actualizarProveedor(Integer id, ProveedorRequestDTO dto) {
        proveedorRepository.actualizarProveedor(
                id,
                dto.getIdEstado(),
                dto.getRuc(),
                dto.getNombreRepresentante(),
                dto.getDireccion(),
                null,
                dto.getTelefonoEmpresa(),
                dto.getCorreoContacto(),
                dto.getIdEmpresa(),
                dto.getIdCiudad()
        );
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
    public void eliminarProveedor(Integer idProveedor) {
        proveedorRepository.eliminarProveedor(idProveedor);
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
}
