package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.*;
import org.uteq.sacpa.entity.inventario.Almacen;

import java.util.List;

public interface IAlmacenService {

    void crearAlmacen(AlmacenRequestDTO dto);

    List<Almacen> listarTodos();

    void desactivarAlmacen(Integer idAlmacen, Integer idEstadoInactivo);

    // ── Cascada 3.1 ──────────────────────────────────────────
    List<ZonaAlmacenResponseDTO>   listarZonasPorAlmacen(Integer idAlmacen);
    List<EstanteriaResponseDTO>    listarEstanteriasPorZona(Integer idZona);
    List<UbicacionInternaResponseDTO> listarUbicacionesPorEstanteria(Integer idEstanteria);
}
