package org.uteq.sacpa.entity.seguridad;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rol_privilegio", schema = "seguridad")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolPrivilegio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol_privilegio")
    private Integer idRolPrivilegio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_privilegio", nullable = false)
    private Privilegio privilegio;
}
