package org.uteq.sacpa.dto.seguridad;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato de correo no es válido")
    private String correo;

    private String contrasena; // Opcional en edición, obligatorio en creación (validado en servicio)

    private Integer idEstado;

    private List<Integer> idRoles;

    // Campos de datos personales (opcionales en edición parcial)
    private String nombres;
    private String apellidos;
    private String cedula;
    private String telefono;
    private String ocupacion;
}
