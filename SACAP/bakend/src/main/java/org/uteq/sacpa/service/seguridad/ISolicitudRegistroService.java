package org.uteq.sacpa.service.seguridad;

import org.uteq.sacpa.dto.seguridad.ProcesarSolicitudDTO;
import org.uteq.sacpa.dto.seguridad.SolicitudRegistroDTO;
import java.util.List;

public interface ISolicitudRegistroService {
    SolicitudRegistroDTO crearSolicitud(SolicitudRegistroDTO solicitud);
    List<SolicitudRegistroDTO> listarPendientes();
    List<SolicitudRegistroDTO> listarTodas();
    void procesarSolicitud(Integer idSolicitud, ProcesarSolicitudDTO dto);
}
