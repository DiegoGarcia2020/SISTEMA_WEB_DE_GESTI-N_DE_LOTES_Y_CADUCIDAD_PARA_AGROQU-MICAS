package org.uteq.sacpa.service.ia_alertas.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ia_alertas.NotificacionRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.Notificacion;
import org.uteq.sacpa.repository.ia_alertas.INotificacionRepository;
import org.uteq.sacpa.service.ia_alertas.INotificacionService;

import java.util.List;

@Service
public class NotificacionServiceImpl implements INotificacionService {

    @Autowired
    private INotificacionRepository notificacionRepository;

    @Override
    public void crearNotificacion(NotificacionRequestDTO dto) {
        notificacionRepository.crearNotificacion(
                dto.getCanal(),
                dto.getIdAlerta(),
                dto.getIdUsuarioDestino()
        );
    }

    @Override
    public List<Notificacion> buscarPorUsuarioDestino(Integer idUsuarioDestino) {
        return notificacionRepository.findByUsuarioDestino_IdUsuarioOrderByFechaEnvioDesc(idUsuarioDestino);
    }

    @Override
    public void registrarLectura(Integer idNotificacion) {
        notificacionRepository.registrarLectura(idNotificacion);
    }
}
