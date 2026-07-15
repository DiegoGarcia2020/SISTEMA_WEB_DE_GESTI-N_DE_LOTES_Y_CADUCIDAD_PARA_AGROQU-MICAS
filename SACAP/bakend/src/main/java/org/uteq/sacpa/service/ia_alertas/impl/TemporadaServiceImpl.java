package org.uteq.sacpa.service.ia_alertas.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ia_modelos.TemporadaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;
import org.uteq.sacpa.repository.ia_alertas.ITemporadaAgricolaRepository;
import org.uteq.sacpa.service.ia_alertas.ITemporadaService;

import java.util.List;

@Service
public class TemporadaServiceImpl implements ITemporadaService {

    @Autowired
    private ITemporadaAgricolaRepository temporadaRepository;

    @Override
    public void crearTemporada(TemporadaRequestDTO dto) {
        temporadaRepository.crearTemporada(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getFechaInicio(),
                dto.getFechaFin(),
                dto.getIdEstado()
        );
    }

    @Override
    public List<TemporadaAgricola> listarTodas() {
        return temporadaRepository.findAll();
    }
}
