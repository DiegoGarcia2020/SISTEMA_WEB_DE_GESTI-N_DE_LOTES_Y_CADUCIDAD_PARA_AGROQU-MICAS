package org.uteq.sacpa.dto.inventario;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Formulario B — datos que completa el BODEGUERO al recibir el lote.
 * Al validar, el lote pasa de EN_REVISION (id=2) a ACTIVO (id=1).
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoteValidacionDTO {

    @NotNull(message = "La cantidad validada es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidadValidada;

    @NotNull(message = "La ubicación física es obligatoria")
    private Integer idUbicacion;

    /** Observaciones opcionales del bodeguero */
    private String  observaciones;
}
