package org.uteq.sacpa.service.geografia;

import org.uteq.sacpa.dto.geografia.CiudadRequestDTO;
import org.uteq.sacpa.entity.geografia.Ciudad;

import java.util.List;

public interface ICiudadService {

    void crearCiudad(CiudadRequestDTO dto);

    List<Ciudad> listarTodos();

    List<Ciudad> listarPorProvincia(Integer idProvincia);

    void actualizarCiudad(Integer idCiudad, CiudadRequestDTO dto);

    void desactivarCiudad(Integer idCiudad);
}
