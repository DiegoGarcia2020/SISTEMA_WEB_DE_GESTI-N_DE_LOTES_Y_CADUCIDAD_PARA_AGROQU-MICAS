package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_alertas.NotificacionRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.Notificacion;

import java.util.List;

public interface INotificacionService {

    void crearNotificacion(NotificacionRequestDTO dto);

    List<Notificacion> buscarPorUsuarioDestino(Integer idUsuarioDestino);

    void registrarLectura(Integer idNotificacion);
}
