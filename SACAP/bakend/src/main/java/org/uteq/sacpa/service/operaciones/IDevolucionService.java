package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.DevolucionRequestDTO;
import org.uteq.sacpa.entity.operaciones.Devolucion;

import java.util.List;

public interface IDevolucionService {

    void crearDevolucion(DevolucionRequestDTO dto);

    List<Devolucion> buscarPorLote(Integer idLote);

    void aprobarDevolucion(Integer idDevolucion, Integer idUsuarioAprobador, String observacionesAprobador, Integer idEstadoAprobado);

    void anularDevolucion(Integer idDevolucion, Integer idEstadoAnulado);

    List<Devolucion> listarPendientes();

    List<Devolucion> listarTodos();

    void cambiarEstadoDevolucion(Integer idDevolucion, org.uteq.sacpa.dto.operaciones.CambioEstadoDevolucionDTO dto);
}
