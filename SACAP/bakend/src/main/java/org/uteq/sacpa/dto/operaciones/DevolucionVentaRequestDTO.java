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
public class DevolucionVentaRequestDTO {

    @NotNull(message = "El ID de la venta es obligatorio")
    private Integer idVenta;

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer idProducto;

    @NotNull(message = "La cantidad devuelta es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidadDevuelta;

    @NotNull(message = "El motivo es obligatorio")
    private String motivo; // MALOGRADO, ARREPENTIMIENTO_SALDO
}
