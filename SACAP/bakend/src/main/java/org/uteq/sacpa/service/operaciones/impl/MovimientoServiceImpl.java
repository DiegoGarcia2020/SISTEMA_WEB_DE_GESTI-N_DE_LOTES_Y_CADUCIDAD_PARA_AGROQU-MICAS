package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.MovimientoRequestDTO;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;
import org.uteq.sacpa.repository.operaciones.IMovimientoInventarioRepository;
import org.uteq.sacpa.service.operaciones.IMovimientoService;

import java.util.List;

@Service
public class MovimientoServiceImpl implements IMovimientoService {

    @Autowired
    private IMovimientoInventarioRepository movimientoRepository;

    @Override
    public void crearMovimiento(MovimientoRequestDTO dto) {
        movimientoRepository.crearMovimiento(
                dto.getCantidad(),
                dto.getObservacion(),
                dto.getIdLote(),
                dto.getIdTipoMovimiento(),
                dto.getIdUsuario(),
                dto.getIdEstadoAprobacion()
        );
    }

    @Override
    public List<MovimientoInventario> buscarPorLote(Integer idLote) {
        return movimientoRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void anularMovimiento(Integer idMovimiento, Integer idEstadoAnulado) {
        movimientoRepository.anularMovimiento(idMovimiento, idEstadoAnulado);
    }
}
