package org.uteq.sacpa.dto.seguridad;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcesarSolicitudDTO {
    private Boolean aprobar; // true para aprobar, false para rechazar
    private List<Integer> idRoles; // Roles a asignar si se aprueba
    private String motivoRechazo; // Motivo si se rechaza
}
