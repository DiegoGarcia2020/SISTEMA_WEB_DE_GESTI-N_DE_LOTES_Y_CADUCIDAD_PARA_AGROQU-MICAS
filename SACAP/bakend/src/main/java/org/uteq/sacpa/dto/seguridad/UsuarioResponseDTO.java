package org.uteq.sacpa.dto.seguridad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Integer idUsuario;
    private String correo;
    private Integer idEstado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private List<String> roles;
    private List<Integer> idRoles;
}
