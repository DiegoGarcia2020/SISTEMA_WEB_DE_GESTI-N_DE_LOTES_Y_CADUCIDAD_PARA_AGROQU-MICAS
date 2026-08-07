package org.uteq.sacpa.dto.seguridad;

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
public class CrearUsuarioBasicoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombres;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellidos;

    @NotBlank(message = "La cédula es obligatoria")
    private String cedula;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato de correo no es válido")
    private String correo;

    private String telefono;

    @NotBlank(message = "El cargo u ocupación en la empresa es obligatorio")
    private String ocupacion;
}
