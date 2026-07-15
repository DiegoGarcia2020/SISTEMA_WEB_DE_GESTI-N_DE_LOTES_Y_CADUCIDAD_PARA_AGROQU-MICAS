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
public class AlmacenRequestDTO {

    @NotBlank(message = "El nombre del almacen es obligatorio")
    private String nombre;

    @NotBlank(message = "La direccion es obligatoria")
    private String direccion;

    @NotNull(message = "La capacidad maxima es obligatoria")
    @DecimalMin(value = "0.0", inclusive = false, message = "La capacidad maxima debe ser mayor a 0")
    private BigDecimal capacidadMaxima;

    @NotNull(message = "El ID de la ciudad es obligatorio")
    private Integer idCiudad;

    @NotNull(message = "El ID de la empresa es obligatorio")
    private Integer idEmpresa;

    @NotNull(message = "El ID del estado es obligatorio")
    private Integer idEstado;
}
