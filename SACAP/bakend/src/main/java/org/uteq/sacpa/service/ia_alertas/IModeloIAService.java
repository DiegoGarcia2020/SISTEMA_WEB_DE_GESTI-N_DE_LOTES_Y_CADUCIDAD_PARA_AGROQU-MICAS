package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.ModeloIARequestDTO;
import org.uteq.sacpa.entity.ia_alertas.ModeloIA;

import java.util.List;

public interface IModeloIAService {

    void crearModelo(ModeloIARequestDTO dto);

    List<ModeloIA> listarTodos();

    void desactivarModelo(Integer idModelo, Integer idEstadoInactivo);
}
