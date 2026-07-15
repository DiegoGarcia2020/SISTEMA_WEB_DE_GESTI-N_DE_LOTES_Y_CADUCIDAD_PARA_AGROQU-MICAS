package org.uteq.sacpa.dto.seguridad;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambioEstadoRequestDTO {

    @NotNull(message = "El id del estado es obligatorio")
    private Integer idEstado;
}
