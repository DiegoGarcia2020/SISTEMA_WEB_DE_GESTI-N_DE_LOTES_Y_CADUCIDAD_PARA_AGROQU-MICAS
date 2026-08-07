package org.uteq.sacpa.entity.seguridad;

import lombok.*;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class UsuarioRolId implements Serializable {
    private Integer usuario;
    private Integer rol;
}
