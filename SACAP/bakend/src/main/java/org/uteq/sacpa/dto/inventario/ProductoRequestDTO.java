package org.uteq.sacpa.dto.inventario;

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
public class ProductoRequestDTO {

    @NotBlank(message = "El nombre del producto es obligatorio")
    private String nombre;

    private String descripcion;

    @NotBlank(message = "La unidad de medida es obligatoria")
    private String unidadMedida;

    @NotNull(message = "El precio sugerido es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio sugerido debe ser mayor a 0")
    private BigDecimal precioSugerido;

    @NotNull(message = "El ID de la categoria es obligatorio")
    private Integer idCategoria;

    @NotNull(message = "El ID del estado es obligatorio")
    private Integer idEstado;
}
