package org.uteq.sacpa.service.operaciones;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.uteq.sacpa.dto.operaciones.DevolucionFisicaRequestDTO;
import org.uteq.sacpa.dto.operaciones.DevolucionVentaRequestDTO;
import org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO;

public interface IDevolucionVentaService {
    DevolucionVentaResponseDTO registrarDevolucionCampo(DevolucionVentaRequestDTO requestDTO);
    DevolucionVentaResponseDTO recibirDevolucionFisica(Integer idDevolucion, DevolucionFisicaRequestDTO request);
    Page<DevolucionVentaResponseDTO> listarPendientesBodega(Pageable pageable);
    java.util.List<org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO> listarPorTecnico(Integer idTecnico);
}
