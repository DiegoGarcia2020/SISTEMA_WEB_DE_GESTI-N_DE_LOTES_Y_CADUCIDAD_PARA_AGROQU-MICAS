package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.VentaRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.util.List;

public interface IVentaService {

    Venta crearVenta(VentaRequestDTO request);

    VentaResponseDTO obtenerPorId(Integer id, Integer idTecnicoFiltro);

    List<VentaResponseDTO> listarVentas(Integer idTecnicoFiltro);
}
