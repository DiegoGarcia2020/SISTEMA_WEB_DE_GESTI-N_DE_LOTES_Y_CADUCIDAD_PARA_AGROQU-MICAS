package org.uteq.sacpa.dto.ia_modelos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class SugerenciaRequestDTO {

    @NotNull(message = "El porcentaje de descuento es obligatorio")
    @DecimalMin(value = "0.0", message = "El descuento no puede ser negativo")
    private BigDecimal porcentajeDescuento;

    @NotBlank(message = "La observacion de la IA es obligatoria")
    private String observaciones;

    @NotNull(message = "El ID del lote es obligatorio")
    private Integer idLote;

    @NotNull(message = "El ID de la temporada es obligatorio")
    private Integer idTemporada;

    @NotNull(message = "El ID de la ejecucion es obligatorio")
    private Integer idEjecucion;

    @NotNull(message = "El ID del estado de aprobacion es obligatorio")
    private Integer idEstadoAprobacion;
}
