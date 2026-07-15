package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_alertas.AlertaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.AlertaCaducidad;

import java.util.List;

public interface IAlertaCaducidadService {

    /** Crea una nueva alerta usando la funcion PL/pgSQL ia_alertas.fn_crear_alerta_caducidad */
    void crearAlerta(AlertaRequestDTO dto);

    /** Obtiene todas las alertas activas */
    List<AlertaCaducidad> listarAlertasActivas(Integer idEstadoActivo);

    /** Obtiene alertas por lote */
    List<AlertaCaducidad> buscarPorLote(Integer idLote);

    /** Descarta una alerta (funcion ia_alertas.fn_descartar_alerta_caducidad) */
    void descartarAlerta(Integer idAlerta, Integer idEstadoDescartado);
}
