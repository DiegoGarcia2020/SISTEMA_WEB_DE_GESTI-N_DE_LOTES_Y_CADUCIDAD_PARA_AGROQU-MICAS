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
    private Boolean requiereCambioClave;
    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;
    private String nombres;
    private String apellidos;
    private String cedula;
    private String telefono;
    private String ocupacion;
    private boolean tieneDocumentoPdf;
    private List<String> roles;
    private List<Integer> idRoles;
}
