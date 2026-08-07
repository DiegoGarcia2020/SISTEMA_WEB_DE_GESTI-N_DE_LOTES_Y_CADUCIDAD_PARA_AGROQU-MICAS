package org.uteq.sacpa.service.entidades;

import java.util.List;
import java.util.Optional;
import org.uteq.sacpa.dto.entidades.ProveedorRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;

public interface IProveedorService {

    void crearProveedor(ProveedorRequestDTO dto);
    
    void actualizarProveedor(Integer id, ProveedorRequestDTO dto);
    
    Proveedor obtenerPorId(Integer id);

    List<Proveedor> listarTodos();


    void eliminarProveedor(Integer idProveedor);

    void asociarProducto(org.uteq.sacpa.dto.entidades.ProveedorProductoDTO dto);
    void desasociarProducto(Integer idProveedor, Integer idProducto);
    List<org.uteq.sacpa.dto.entidades.ProveedorProductoDTO> listarProductosDeProveedor(Integer idProveedor);

    Optional<Proveedor> buscarPorIdUsuario(Integer idUsuario);

}
