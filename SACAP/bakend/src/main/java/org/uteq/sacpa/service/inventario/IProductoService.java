package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.ProductoRequestDTO;
import org.uteq.sacpa.entity.inventario.Producto;

import java.util.List;

public interface IProductoService {

    Producto crearProducto(ProductoRequestDTO dto);
    
    Producto actualizarProducto(Integer id, ProductoRequestDTO dto);
    
    Producto obtenerPorId(Integer id);

    List<Producto> listarTodos();

    void desactivarProducto(Integer idProducto, Integer idEstadoInactivo);
}
