package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.MovimientoRequestDTO;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;

import java.util.List;
import org.uteq.sacpa.dto.operaciones.MovimientoResumenDTO;

public interface IMovimientoService {

    void crearMovimiento(MovimientoRequestDTO dto);

    List<MovimientoInventario> buscarPorLote(Integer idLote);

    void anularMovimiento(Integer idMovimiento, Integer idEstadoAnulado);

    void despacharFefo(org.uteq.sacpa.dto.operaciones.DespachoRequestDTO dto);

    List<MovimientoResumenDTO> listarPendientes();

    List<MovimientoResumenDTO> listarTodos();

    void aprobarDespacho(Integer idMovimiento, String observacion);

    void rechazarDespacho(Integer idMovimiento, String observacion);

    List<org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO> listarLotesDisponiblesFefo();
}
