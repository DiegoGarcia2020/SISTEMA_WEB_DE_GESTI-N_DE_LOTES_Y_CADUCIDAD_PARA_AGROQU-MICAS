package org.uteq.sacpa.dto.ia_modelos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReglaNegocioIARequestDTO {
    @NotNull(message = "El descuento maximo es obligatorio")
    @DecimalMin(value = "0.0", message = "El descuento maximo no puede ser negativo")
    private BigDecimal descuentoMaximo;

    @NotNull(message = "Debe indicar si las promociones automaticas estan activas")
    private Boolean activarPromociones;

    private Integer diasAlertaAnticipada;
}
