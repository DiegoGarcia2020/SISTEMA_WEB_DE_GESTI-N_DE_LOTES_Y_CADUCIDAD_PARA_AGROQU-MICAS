package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.TemporadaRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.TemporadaResponseDTO;

import java.util.List;

public interface ITemporadaService {

    TemporadaResponseDTO crearTemporada(TemporadaRequestDTO dto);

    List<TemporadaResponseDTO> listarTodas();

    void cambiarEstado(Integer idTemporada, String estado);
}
