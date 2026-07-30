package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.VentaRequestDTO;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.util.List;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;

public interface IVentaService {
    Venta crearVenta(VentaRequestDTO request);
    VentaResponseDTO obtenerPorId(Integer id);
    List<VentaResponseDTO> listarVentas();
}
