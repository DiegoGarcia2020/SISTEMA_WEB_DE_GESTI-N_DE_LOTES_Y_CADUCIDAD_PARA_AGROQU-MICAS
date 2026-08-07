package org.uteq.sacpa.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {
    @NotBlank(message = "El usuario o correo es obligatorio")
    private String correo;

    @NotBlank(message = "La contrasena es obligatoria")
    private String contrasena;
}

