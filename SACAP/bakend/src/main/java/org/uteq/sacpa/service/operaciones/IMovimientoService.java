package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.MovimientoRequestDTO;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;

import java.util.List;

public interface IMovimientoService {

    void crearMovimiento(MovimientoRequestDTO dto);

    List<MovimientoInventario> buscarPorLote(Integer idLote);

    void anularMovimiento(Integer idMovimiento, Integer idEstadoAnulado);

    void despacharFefo(org.uteq.sacpa.dto.operaciones.DespachoRequestDTO dto);

    List<MovimientoInventario> listarPendientes();

    List<MovimientoInventario> listarTodos();

    void aprobarDespacho(Integer idMovimiento, String observacion);

    void rechazarDespacho(Integer idMovimiento, String observacion);

    List<org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO> listarLotesDisponiblesFefo();
}
