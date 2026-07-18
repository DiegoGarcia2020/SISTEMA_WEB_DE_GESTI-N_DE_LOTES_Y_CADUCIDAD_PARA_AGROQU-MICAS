package org.uteq.sacpa.dto.inventario;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Formulario A — datos que declara el PROVEEDOR en el pre-registro del lote.
 * El lote queda en estado EN_REVISION (id=2) hasta que el Bodeguero lo valide.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LotePreRegistroDTO {

    @NotBlank(message = "El número de lote es obligatorio")
    private String    numeroLote;

    @NotNull(message = "La fecha de fabricación es obligatoria")
    private LocalDate fechaFabricacion;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate fechaVencimiento;

    @NotNull(message = "La cantidad declarada es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer   cantidadDeclarada;

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer   idProducto;

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Integer   idProveedor;
}
