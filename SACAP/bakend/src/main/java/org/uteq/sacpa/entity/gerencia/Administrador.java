package org.uteq.sacpa.entity.gerencia;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

@Entity
@Table(name = "administrador", schema = "gerencia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Administrador {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_administrador") private Integer idAdministrador;
    @Column(name = "cedula", length = 20) private String cedula;
    @Column(name = "nombres", length = 150) private String nombres;
    @Column(name = "apellidos", length = 150) private String apellidos;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "foto_perfil", columnDefinition = "text") private String fotoPerfil;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario") private Usuario usuario;
}
