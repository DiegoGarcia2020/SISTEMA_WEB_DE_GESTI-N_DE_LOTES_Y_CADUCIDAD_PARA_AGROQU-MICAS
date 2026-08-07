package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.TemporadaRequestDTO;
import org.uteq.sacpa.dto.operaciones.TemporadaResponseDTO;

import java.util.List;

public interface ITemporadaService {
    
    /**
     * Activa una nueva temporada. 
     * Si ya existe una temporada activa, la cierra (estado INACTIVO y fechaFin = hoy).
     */
    TemporadaResponseDTO aperturarTemporada(TemporadaRequestDTO request);
    
    /**
     * Obtiene la temporada que actualmente está activa.
     */
    TemporadaResponseDTO obtenerTemporadaActiva();
    
    /**
     * Lista el historial completo de temporadas.
     */
    List<TemporadaResponseDTO> listarTemporadas();
}
