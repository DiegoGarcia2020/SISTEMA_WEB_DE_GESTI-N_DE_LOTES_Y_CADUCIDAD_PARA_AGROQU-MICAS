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
public class ProvinciaRequestDTO {

    @NotBlank(message = "El nombre de la provincia es obligatorio")
    private String nombre;

    @NotNull(message = "El ID del pais es obligatorio")
    private Integer idPais;
}
