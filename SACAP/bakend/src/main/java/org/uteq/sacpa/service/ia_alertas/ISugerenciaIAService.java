package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.SugerenciaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;

import java.util.List;

public interface ISugerenciaIAService {

    void crearSugerencia(SugerenciaRequestDTO dto);

    List<SugerenciaIA> buscarPorLote(Integer idLote);

    void actualizarEstadoSugerencia(Integer idSugerencia, Integer idEstadoAprobacion);
}
