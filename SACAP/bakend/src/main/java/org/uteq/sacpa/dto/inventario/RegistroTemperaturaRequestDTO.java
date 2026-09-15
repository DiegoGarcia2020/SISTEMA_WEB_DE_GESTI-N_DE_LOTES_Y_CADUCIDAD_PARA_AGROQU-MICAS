package org.uteq.sacpa.dto.inventario;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroTemperaturaRequestDTO {

    @NotNull(message = "La zona es obligatoria")
    private Integer idZona;

    @NotNull(message = "La temperatura es obligatoria")
    private BigDecimal temperatura;

    private BigDecimal humedadRelativa;

    private String observaciones;
}
