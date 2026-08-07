package org.uteq.sacpa.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambioContrasenaRequestDTO {
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    private String nuevaContrasena;
}
