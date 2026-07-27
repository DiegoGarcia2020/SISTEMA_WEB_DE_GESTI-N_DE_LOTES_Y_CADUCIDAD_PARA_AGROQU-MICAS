package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.VentaRequestDTO;
import org.uteq.sacpa.entity.operaciones.Venta;

public interface IVentaService {
    Venta crearVenta(VentaRequestDTO request);
}
