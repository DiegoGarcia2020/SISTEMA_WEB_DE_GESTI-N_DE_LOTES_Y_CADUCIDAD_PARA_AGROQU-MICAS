package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.DevolucionVentaRequestDTO;
import org.uteq.sacpa.entity.operaciones.DevolucionVenta;

public interface IDevolucionVentaService {
    DevolucionVenta registrarDevolucionCampo(DevolucionVentaRequestDTO requestDTO);
    DevolucionVenta recibirDevolucionFisica(Integer idDevolucion, String estadoInventario);
    java.util.List<org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO> listarPendientesBodega();
}
