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
 * Formulario "+ Nuevo Lote" del Dashboard del Supervisor.
 * El Supervisor crea el lote dentro de una de sus bodegas asignadas; queda
 * "flotante" (sin ubicación física) hasta que el Bodeguero lo reciba y lo
 * ubique en una estantería.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoteSupervisorRequestDTO {

    @NotBlank(message = "El numero de lote es obligatorio")
    private String numeroLote;

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer idProducto;

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Integer idProveedor;

    @NotNull(message = "El ID de la bodega es obligatorio")
    private Integer idAlmacen;

    @NotNull(message = "La fecha de fabricacion es obligatoria")
    private LocalDate fechaFabricacion;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate fechaVencimiento;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;
}
