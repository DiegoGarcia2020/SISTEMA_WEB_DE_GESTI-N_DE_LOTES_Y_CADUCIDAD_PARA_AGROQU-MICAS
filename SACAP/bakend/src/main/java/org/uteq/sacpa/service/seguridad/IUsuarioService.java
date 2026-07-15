package org.uteq.sacpa.service.seguridad;

import org.uteq.sacpa.dto.seguridad.UsuarioRequestDTO;
import org.uteq.sacpa.dto.seguridad.UsuarioResponseDTO;

import java.util.List;

public interface IUsuarioService {

    List<UsuarioResponseDTO> listarTodos();

    UsuarioResponseDTO obtenerPorId(Integer id);

    UsuarioResponseDTO crear(UsuarioRequestDTO request);

    UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO request);

    void cambiarEstado(Integer id, Integer idEstado);

    void eliminar(Integer id);
}
