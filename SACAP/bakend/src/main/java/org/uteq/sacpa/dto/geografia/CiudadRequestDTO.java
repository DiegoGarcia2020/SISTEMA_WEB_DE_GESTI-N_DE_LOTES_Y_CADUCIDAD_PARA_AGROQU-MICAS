package org.uteq.sacpa.dto.geografia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CiudadRequestDTO {

    @NotBlank(message = "El nombre de la ciudad es obligatorio")
    private String nombre;

    @NotNull(message = "El ID de la provincia es obligatorio")
    private Integer idProvincia;
}
