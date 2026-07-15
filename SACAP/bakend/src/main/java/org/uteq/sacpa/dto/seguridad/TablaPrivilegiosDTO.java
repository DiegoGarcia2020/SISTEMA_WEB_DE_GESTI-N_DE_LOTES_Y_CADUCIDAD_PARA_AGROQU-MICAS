package org.uteq.sacpa.dto.seguridad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.seguridad.Privilegio;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TablaPrivilegiosDTO {
    private String nombreTabla;
    private List<Privilegio> privilegios;
}
