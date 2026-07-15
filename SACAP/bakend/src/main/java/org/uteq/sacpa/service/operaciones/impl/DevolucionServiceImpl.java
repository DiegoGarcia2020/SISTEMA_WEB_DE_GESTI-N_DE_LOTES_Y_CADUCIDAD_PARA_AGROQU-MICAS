package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.DevolucionRequestDTO;
import org.uteq.sacpa.entity.operaciones.Devolucion;
import org.uteq.sacpa.repository.operaciones.IDevolucionRepository;
import org.uteq.sacpa.service.operaciones.IDevolucionService;

import java.util.List;

@Service
public class DevolucionServiceImpl implements IDevolucionService {

    @Autowired
    private IDevolucionRepository devolucionRepository;

    @Override
    public void crearDevolucion(DevolucionRequestDTO dto) {
        devolucionRepository.crearDevolucion(
                dto.getMotivo(),
                dto.getCantidadDevuelta(),
                dto.getIdLote(),
                dto.getIdProveedor(),
                null,
                dto.getIdEstadoAprobacion()
        );
    }

    @Override
    public List<Devolucion> buscarPorLote(Integer idLote) {
        return devolucionRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void aprobarDevolucion(Integer idDevolucion, Integer idUsuarioAprobador, String observacionesAprobador, Integer idEstadoAprobado) {
        devolucionRepository.aprobarDevolucion(idDevolucion, idEstadoAprobado);
    }

    @Override
    public void anularDevolucion(Integer idDevolucion, Integer idEstadoAnulado) {
        devolucionRepository.anularDevolucion(idDevolucion, idEstadoAnulado, null);
    }
}
