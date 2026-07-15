package org.uteq.sacpa.service.inventario.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.inventario.ProductoRequestDTO;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.service.inventario.IProductoService;

import java.util.List;

@Service
public class ProductoServiceImpl implements IProductoService {

    @Autowired
    private IProductoRepository productoRepository;

    @Override
    public void crearProducto(ProductoRequestDTO dto) {
        productoRepository.crearProducto(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getUnidadMedida(),
                dto.getPrecioSugerido(),
                dto.getIdCategoria(),
                dto.getIdEstado()
        );
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
