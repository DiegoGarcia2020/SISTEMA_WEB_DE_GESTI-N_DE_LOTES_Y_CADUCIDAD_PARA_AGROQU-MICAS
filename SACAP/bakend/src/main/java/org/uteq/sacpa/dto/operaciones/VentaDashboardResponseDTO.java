package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;
import org.uteq.sacpa.dto.ia_modelos.TemporadaResponseDTO;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VentaDashboardResponseDTO {
    private List<TemporadaResponseDTO> temporadasActivas;
    private List<PromocionResponseDTO> promocionesActivas;
    private Integer ventasHoyCantidad;
    private BigDecimal ventasHoyTotal;
}
