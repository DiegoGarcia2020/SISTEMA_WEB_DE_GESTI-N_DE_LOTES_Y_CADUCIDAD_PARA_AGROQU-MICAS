package org.uteq.sacpa.service.entidades;

import org.uteq.sacpa.dto.entidades.ProveedorRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;

import java.util.List;
import java.util.Optional;

public interface IProveedorService {

    void crearProveedor(ProveedorRequestDTO dto);

    List<Proveedor> listarTodos();

    void eliminarProveedor(Integer idUsuario);

    Optional<Proveedor> buscarPorIdUsuario(Integer idUsuario);
}
