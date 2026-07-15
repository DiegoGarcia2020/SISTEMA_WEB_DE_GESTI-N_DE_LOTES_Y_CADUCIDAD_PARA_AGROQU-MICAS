package org.uteq.sacpa.service.ia_alertas.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ia_modelos.ModeloIARequestDTO;
import org.uteq.sacpa.entity.ia_alertas.ModeloIA;
import org.uteq.sacpa.repository.ia_alertas.IModeloIARepository;
import org.uteq.sacpa.service.ia_alertas.IModeloIAService;

import java.util.List;

@Service
public class ModeloIAServiceImpl implements IModeloIAService {

    @Autowired
    private IModeloIARepository modeloRepository;

    @Override
    public void crearModelo(ModeloIARequestDTO dto) {
        modeloRepository.crearModelo(
                dto.getNombreModelo(),
                dto.getVersion(),
                dto.getDescripcion()
        );
    }

    @Override
    public List<ModeloIA> listarTodos() {
        return modeloRepository.findAll();
    }

    @Override
    public void desactivarModelo(Integer idModelo, Integer idEstadoInactivo) {
        modeloRepository.desactivarModelo(idModelo);
    }
}
