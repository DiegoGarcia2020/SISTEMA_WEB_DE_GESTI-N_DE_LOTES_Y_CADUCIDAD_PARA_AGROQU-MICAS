package org.uteq.sacpa.service.ia_alertas.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ia_modelos.SugerenciaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;
import org.uteq.sacpa.repository.ia_alertas.ISugerenciaIARepository;
import org.uteq.sacpa.service.ia_alertas.ISugerenciaIAService;

import java.util.List;

@Service
public class SugerenciaIAServiceImpl implements ISugerenciaIAService {

    @Autowired
    private ISugerenciaIARepository sugerenciaRepository;

    @Override
    public void crearSugerencia(SugerenciaRequestDTO dto) {
        sugerenciaRepository.crearSugerencia(
                dto.getPorcentajeDescuento(),
                dto.getObservaciones(),
                dto.getIdLote(),
                dto.getIdTemporada(),
                dto.getIdEjecucion(),
                dto.getIdEstadoAprobacion()
        );
    }

    @Override
    public List<SugerenciaIA> buscarPorLote(Integer idLote) {
        return sugerenciaRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void actualizarEstadoSugerencia(Integer idSugerencia, Integer idEstadoAprobacion) {
        sugerenciaRepository.actualizarEstado(idSugerencia, idEstadoAprobacion);
    }
}
