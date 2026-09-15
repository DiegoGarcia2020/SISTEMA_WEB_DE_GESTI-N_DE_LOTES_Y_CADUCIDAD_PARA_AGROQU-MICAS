package org.uteq.sacpa.dto.seguridad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Perfil propio del usuario autenticado, sin importar su rol (Administrador, Supervisor, Bodeguero o Tecnico de Campo). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MiPerfilResponseDTO {
    private Integer idUsuario;
    private String correo;
    private String nombres;
    private String apellidos;
    private String telefono;
    private String ocupacion;
    private String fotoPerfil;
    private List<String> roles;
}
