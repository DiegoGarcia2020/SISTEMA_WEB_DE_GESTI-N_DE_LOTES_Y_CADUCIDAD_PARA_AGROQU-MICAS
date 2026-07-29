package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.ReglaNegocioIARequestDTO;
import org.uteq.sacpa.dto.ia_modelos.ReglaNegocioIAResponseDTO;

public interface IReglaNegocioIAService {
    /** Devuelve la única regla activa; si no existe ninguna, crea una con valores por defecto. */
    ReglaNegocioIAResponseDTO obtenerRegla();

    ReglaNegocioIAResponseDTO actualizarRegla(ReglaNegocioIARequestDTO dto);
}
