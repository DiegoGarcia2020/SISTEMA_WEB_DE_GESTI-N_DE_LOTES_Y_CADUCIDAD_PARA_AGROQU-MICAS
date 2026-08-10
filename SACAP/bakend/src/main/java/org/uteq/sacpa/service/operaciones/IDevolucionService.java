package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.DevolucionRequestDTO;
import org.uteq.sacpa.entity.operaciones.Devolucion;

import java.util.List;
import org.uteq.sacpa.dto.operaciones.DevolucionResumenDTO;

public interface IDevolucionService {

    void crearDevolucion(DevolucionRequestDTO dto);

    List<Devolucion> buscarPorLote(Integer idLote);

    void aprobarDevolucion(Integer idDevolucion, Integer idUsuarioAprobador, String observacionesAprobador, Integer idEstadoAprobado);

    void anularDevolucion(Integer idDevolucion, Integer idEstadoAnulado);

    List<DevolucionResumenDTO> listarPendientes();

    List<DevolucionResumenDTO> listarTodos();

    void cambiarEstadoDevolucion(Integer idDevolucion, org.uteq.sacpa.dto.operaciones.CambioEstadoDevolucionDTO dto);
}
