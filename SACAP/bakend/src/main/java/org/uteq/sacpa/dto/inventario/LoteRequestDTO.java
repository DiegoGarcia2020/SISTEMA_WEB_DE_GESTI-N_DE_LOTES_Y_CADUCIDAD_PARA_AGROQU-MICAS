package org.uteq.sacpa.dto.inventario;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoteRequestDTO {

    @NotBlank(message = "El numero de lote es obligatorio")
    private String numeroLote;

    @NotNull(message = "La fecha de fabricacion es obligatoria")
    private LocalDate fechaFabricacion;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate fechaVencimiento;

    @NotNull(message = "La cantidad inicial es obligatoria")
    @Min(value = 1, message = "La cantidad inicial debe ser mayor a 0")
    private Integer cantidadInicial;

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer idProducto;

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Integer idProveedor;

    @NotNull(message = "El ID de la ubicacion es obligatorio")
    private Integer idUbicacion;

    @NotNull(message = "El ID del estado del lote es obligatorio")
    private Integer idEstadoLote;
}
