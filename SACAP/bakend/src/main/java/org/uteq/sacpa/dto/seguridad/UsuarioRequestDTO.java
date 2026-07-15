package org.uteq.sacpa.dto.seguridad;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "El estado es obligatorio")
    private Integer idEstado;

    @NotEmpty(message = "Debe asignar al menos un rol al usuario")
    private List<Integer> idRoles;
}
