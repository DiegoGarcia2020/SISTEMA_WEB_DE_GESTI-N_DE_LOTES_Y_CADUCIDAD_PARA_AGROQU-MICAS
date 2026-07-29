package org.uteq.sacpa.dto.ia_modelos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.ia_alertas.ReglaNegocioIA;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReglaNegocioIAResponseDTO {
    private Integer idRegla;
    private BigDecimal descuentoMaximo;
    private Boolean activarPromociones;
    private Integer diasAlertaAnticipada;
    /** No hay un modelo de IA externo real: el motor es un conjunto de reglas determinísticas en el backend. */
    private String modeloIaActivo;

    public static ReglaNegocioIAResponseDTO from(ReglaNegocioIA r) {
        return ReglaNegocioIAResponseDTO.builder()
                .idRegla(r.getIdRegla())
                .descuentoMaximo(r.getDescuentoMaximo())
                .activarPromociones(r.getActivarPromociones())
                .diasAlertaAnticipada(r.getDiasAlertaAnticipada() != null ? r.getDiasAlertaAnticipada() : 60)
                .modeloIaActivo("Motor de Reglas SACPA v1.0 (determinístico)")
                .build();
    }
}
