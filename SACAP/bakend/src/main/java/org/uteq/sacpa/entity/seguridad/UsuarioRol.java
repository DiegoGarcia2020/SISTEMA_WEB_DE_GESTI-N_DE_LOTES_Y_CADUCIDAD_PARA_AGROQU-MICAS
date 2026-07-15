package org.uteq.sacpa.entity.seguridad;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario_rol", schema = "seguridad")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioRol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_rol")
    private Integer idUsuarioRol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;
}
