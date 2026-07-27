package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_alertas.AlertaRequestDTO;
import org.uteq.sacpa.dto.ia_alertas.AlertaCaducidadResponseDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;

import java.util.List;

public interface IAlertaCaducidadService {

    /** Crea una nueva alerta usando la funcion PL/pgSQL ia_alertas.fn_crear_alerta_caducidad */
    void crearAlerta(AlertaRequestDTO dto);

    /** Obtiene todas las alertas activas */
    List<AlertaCaducidadResponseDTO> listarAlertasActivas(Integer idEstadoActivo);

    /** Obtiene alertas por lote */
    List<AlertaCaducidadResponseDTO> buscarPorLote(Integer idLote);

    /** Descarta una alerta (funcion ia_alertas.fn_descartar_alerta_caducidad) */
    void descartarAlerta(Integer idAlerta, Integer idEstadoDescartado);

    /**
     * Corre el Motor de Sugerencias sobre el lote de la alerta y genera una
     * SugerenciaIA + Promocion (estado SUGERIDA) a partir de ella.
     * @param idUsuarioAprueba usuario (ADMINISTRADOR/SUPERVISOR) que registra la promoción sugerida
     */
    PromocionResponseDTO promoverAlerta(Integer idAlerta, Integer idUsuarioAprueba);
}
