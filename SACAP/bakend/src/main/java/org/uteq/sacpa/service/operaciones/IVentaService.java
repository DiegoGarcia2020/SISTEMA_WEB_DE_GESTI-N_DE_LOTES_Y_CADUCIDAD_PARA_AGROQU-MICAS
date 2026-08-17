package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.ventas.VentaRequestDTO;
import org.uteq.sacpa.dto.ventas.VentasMasVendidosDTO;

import java.time.LocalDateTime;

public interface IVentaService {

    VentasMasVendidosDTO masVendidos(String periodo, Integer top);

    VentasMasVendidosDTO masVendidos(String periodo, Integer top, LocalDateTime desde, LocalDateTime hasta);

    void registrarVenta(VentaRequestDTO dto);
}
