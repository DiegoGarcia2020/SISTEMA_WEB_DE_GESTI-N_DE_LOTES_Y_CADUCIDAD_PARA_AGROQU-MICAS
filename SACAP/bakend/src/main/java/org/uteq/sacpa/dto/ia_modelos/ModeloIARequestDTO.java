package org.uteq.sacpa.dto.ia_modelos;

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
public class ModeloIARequestDTO {

    @NotBlank(message = "El nombre del modelo es obligatorio")
    private String nombreModelo;

    @NotBlank(message = "La version es obligatoria")
    private String version;

    private String descripcion;

    @NotBlank(message = "El endpoint del modelo es obligatorio")
    private String endpointModelo;

    @NotNull(message = "El ID del estado es obligatorio")
    private Integer idEstado;
}
