package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.ProductoRequestDTO;
import org.uteq.sacpa.entity.inventario.Producto;

import java.util.List;

public interface IProductoService {

    void crearProducto(ProductoRequestDTO dto);

    List<Producto> listarTodos();

    void desactivarProducto(Integer idProducto, Integer idEstadoInactivo);
}
