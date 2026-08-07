package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DespachoRequestDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer idProducto;

    @NotNull(message = "La cantidad a despachar es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    private String observacion;

    @NotNull(message = "El ID del usuario/bodeguero es obligatorio")
    private Integer idUsuario;
}
