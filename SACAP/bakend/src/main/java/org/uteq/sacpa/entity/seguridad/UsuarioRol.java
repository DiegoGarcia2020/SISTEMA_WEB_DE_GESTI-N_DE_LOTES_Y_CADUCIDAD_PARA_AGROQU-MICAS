package org.uteq.sacpa.entity.seguridad;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario_rol", schema = "seguridad")
@IdClass(UsuarioRolId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioRol {

    @Transient
    private Integer idUsuarioRol;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;
}
