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
public class MovimientoRequestDTO {

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    private String observacion;

    @NotNull(message = "El ID del lote es obligatorio")
    private Integer idLote;

    @NotNull(message = "El ID del tipo de movimiento es obligatorio")
    private Integer idTipoMovimiento;

    @NotNull(message = "El ID del usuario es obligatorio")
    private Integer idUsuario;

    @NotNull(message = "El ID del estado de aprobacion es obligatorio")
    private Integer idEstadoAprobacion;
}
