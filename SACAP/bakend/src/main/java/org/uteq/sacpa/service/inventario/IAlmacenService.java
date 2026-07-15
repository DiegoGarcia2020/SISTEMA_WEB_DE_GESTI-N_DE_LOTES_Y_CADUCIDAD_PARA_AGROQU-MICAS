package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.AlmacenRequestDTO;
import org.uteq.sacpa.entity.inventario.Almacen;

import java.util.List;

public interface IAlmacenService {

    void crearAlmacen(AlmacenRequestDTO dto);

    List<Almacen> listarTodos();

    void desactivarAlmacen(Integer idAlmacen, Integer idEstadoInactivo);
}
