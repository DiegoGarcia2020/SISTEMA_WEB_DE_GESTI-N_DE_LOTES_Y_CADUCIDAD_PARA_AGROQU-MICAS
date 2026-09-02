package org.uteq.sacpa.service.inventario.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.inventario.ProductoRequestDTO;
import org.uteq.sacpa.entity.catalogos.Formulacion;
import org.uteq.sacpa.entity.catalogos.Toxicidad;
import org.uteq.sacpa.entity.inventario.Categoria;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.repository.catalogos.IFormulacionRepository;
import org.uteq.sacpa.repository.catalogos.IToxicidadRepository;
import org.uteq.sacpa.repository.inventario.ICategoriaRepository;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.service.inventario.IProductoService;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductoServiceImpl implements IProductoService {

    @Autowired
    private IProductoRepository productoRepository;

    @Autowired
    private ICategoriaRepository categoriaRepository;

    @Autowired
    private IFormulacionRepository formulacionRepository;

    @Autowired
    private IToxicidadRepository toxicidadRepository;

    @Override
    @Transactional
    public Producto crearProducto(ProductoRequestDTO dto) {
        Categoria categoria = dto.getIdCategoria() != null 
                ? categoriaRepository.findById(dto.getIdCategoria()).orElse(null) 
                : null;
        
        Formulacion formulacion = dto.getIdFormulacion() != null 
                ? formulacionRepository.findById(dto.getIdFormulacion()).orElse(null) 
                : null;
                
        Toxicidad toxicidad = dto.getIdToxicidad() != null 
                ? toxicidadRepository.findById(dto.getIdToxicidad()).orElse(null) 
                : null;

        Producto producto = Producto.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .unidadMedida(dto.getUnidadMedida())
                .precio(dto.getPrecioSugerido())
                .idEstado(dto.getIdEstado() != null ? dto.getIdEstado() : 1)
                .categoria(categoria)
                .ingredienteActivo(dto.getIngredienteActivo())
                .periodoCarenciaDias(dto.getPeriodoCarenciaDias())
                .toxicidad(toxicidad)
                .formulacion(formulacion)
                .aplicaIva(dto.getAplicaIva() != null ? dto.getAplicaIva() : false)
                .porcentajeIva(dto.getPorcentajeIva() != null ? dto.getPorcentajeIva() : BigDecimal.ZERO)
                .build();

        return productoRepository.save(producto);
    }
    
    @Override
    @Transactional
    public Producto actualizarProducto(Integer id, ProductoRequestDTO dto) {
        Producto producto = obtenerPorId(id);

        Categoria categoria = dto.getIdCategoria() != null 
                ? categoriaRepository.findById(dto.getIdCategoria()).orElse(producto.getCategoria()) 
                : producto.getCategoria();
        
        Formulacion formulacion = dto.getIdFormulacion() != null 
                ? formulacionRepository.findById(dto.getIdFormulacion()).orElse(null) 
                : null;
                
        Toxicidad toxicidad = dto.getIdToxicidad() != null 
                ? toxicidadRepository.findById(dto.getIdToxicidad()).orElse(null) 
                : null;

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setUnidadMedida(dto.getUnidadMedida());
        producto.setPrecio(dto.getPrecioSugerido());
        producto.setIdEstado(dto.getIdEstado() != null ? dto.getIdEstado() : producto.getIdEstado());
        producto.setCategoria(categoria);
        producto.setIngredienteActivo(dto.getIngredienteActivo());
        producto.setPeriodoCarenciaDias(dto.getPeriodoCarenciaDias());
        producto.setToxicidad(toxicidad);
        producto.setFormulacion(formulacion);
        producto.setAplicaIva(dto.getAplicaIva() != null ? dto.getAplicaIva() : false);
        producto.setPorcentajeIva(dto.getPorcentajeIva() != null ? dto.getPorcentajeIva() : BigDecimal.ZERO);

        return productoRepository.save(producto);
    }

    @Override
    public Producto obtenerPorId(Integer id) {
        return productoRepository.findById(id).orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    @Override
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Override
    public void desactivarProducto(Integer idProducto, Integer idEstadoInactivo) {
        productoRepository.desactivarProducto(idProducto, idEstadoInactivo);
    }
}

