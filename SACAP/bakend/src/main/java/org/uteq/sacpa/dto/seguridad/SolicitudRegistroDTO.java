package org.uteq.sacpa.dto.seguridad;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudRegistroDTO {
    private Integer idSolicitud;
    private String correo;
    private String nombres;
    private String apellidos;
    private String cedula;
    private String telefono;
    private String departamento;
    private String cargo;
    private LocalDateTime fechaSolicitud;
    private Integer idEstado; // 1=PENDIENTE, 2=APROBADA, 3=RECHAZADA
    private String motivoRechazo;
}
