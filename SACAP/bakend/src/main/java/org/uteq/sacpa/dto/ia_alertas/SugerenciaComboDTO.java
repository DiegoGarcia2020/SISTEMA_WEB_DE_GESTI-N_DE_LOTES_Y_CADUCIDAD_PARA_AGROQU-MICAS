package org.uteq.sacpa.dto.ia_alertas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/** Resultado del Motor de Sugerencias: un producto individual o un combo de varios, con justificación. */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SugerenciaComboDTO {
    private String titulo;
    private Boolean esCombo;
    private Integer score;
    private BigDecimal descuentoSugerido;
    private String justificacionIA;
    private List<LoteSugeridoDTO> lotes;
}
