package org.uteq.sacpa.service.geografia;

import org.uteq.sacpa.dto.geografia.PaisRequestDTO;
import org.uteq.sacpa.entity.geografia.Pais;

import java.util.List;

public interface IPaisService {

    void crearPais(PaisRequestDTO dto);

    List<Pais> listarTodos();

    void actualizarPais(Integer idPais, PaisRequestDTO dto);

    void desactivarPais(Integer idPais);
}
