package org.uteq.sacpa.service.ia_alertas.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ia_alertas.AlertaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.AlertaCaducidad;
import org.uteq.sacpa.repository.ia_alertas.IAlertaCaducidadRepository;
import org.uteq.sacpa.service.ia_alertas.IAlertaCaducidadService;

import java.util.List;

@Service
public class AlertaCaducidadServiceImpl implements IAlertaCaducidadService {

    @Autowired
    private IAlertaCaducidadRepository alertaRepository;

    @Override
    public void crearAlerta(AlertaRequestDTO dto) {
        alertaRepository.crearAlerta(
                dto.getMensaje(),
                dto.getIdLote(),
                dto.getIdNivelAlerta(),
                dto.getIdEstado()
        );
    }

    @Override
    public List<AlertaCaducidad> listarAlertasActivas(Integer idEstadoActivo) {
        return alertaRepository.findAlertasActivas(idEstadoActivo);
    }

    @Override
    public List<AlertaCaducidad> buscarPorLote(Integer idLote) {
        return alertaRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void descartarAlerta(Integer idAlerta, Integer idEstadoDescartado) {
        alertaRepository.descartarAlerta(idAlerta, idEstadoDescartado);
    }
}
