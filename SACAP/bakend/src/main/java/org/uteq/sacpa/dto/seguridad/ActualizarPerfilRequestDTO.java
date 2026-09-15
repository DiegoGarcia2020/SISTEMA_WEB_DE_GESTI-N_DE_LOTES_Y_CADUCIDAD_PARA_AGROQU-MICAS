package org.uteq.sacpa.dto.seguridad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarPerfilRequestDTO {
    private String nombres;
    private String apellidos;
    private String telefono;
    private String ocupacion;
}
