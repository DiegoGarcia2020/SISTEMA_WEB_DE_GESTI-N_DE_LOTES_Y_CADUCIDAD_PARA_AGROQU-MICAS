package org.uteq.sacpa.service.geografia;

import org.uteq.sacpa.dto.geografia.ProvinciaRequestDTO;
import org.uteq.sacpa.entity.geografia.Provincia;

import java.util.List;

public interface IProvinciaService {

    void crearProvincia(ProvinciaRequestDTO dto);

    List<Provincia> listarTodos();

    List<Provincia> listarPorPais(Integer idPais);

    void actualizarProvincia(Integer idProvincia, ProvinciaRequestDTO dto);

    void desactivarProvincia(Integer idProvincia);
}
