package org.uteq.sacpa.dto.geografia;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaisRequestDTO {

    @NotBlank(message = "El nombre del pais es obligatorio")
    private String nombre;

    @NotBlank(message = "El codigo ISO del pais es obligatorio")
    private String codigoIso;
}
