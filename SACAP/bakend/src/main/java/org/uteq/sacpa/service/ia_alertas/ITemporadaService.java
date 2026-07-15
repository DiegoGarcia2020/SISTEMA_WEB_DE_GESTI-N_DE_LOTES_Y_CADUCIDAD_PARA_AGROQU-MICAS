package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.TemporadaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;

import java.util.List;

public interface ITemporadaService {

    void crearTemporada(TemporadaRequestDTO dto);

    List<TemporadaAgricola> listarTodas();
}
