package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.MovimientoRequestDTO;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;

import java.util.List;

public interface IMovimientoService {

    void crearMovimiento(MovimientoRequestDTO dto);

    List<MovimientoInventario> buscarPorLote(Integer idLote);

    void anularMovimiento(Integer idMovimiento, Integer idEstadoAnulado);
}
