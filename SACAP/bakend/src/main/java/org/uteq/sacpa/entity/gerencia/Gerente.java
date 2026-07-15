package org.uteq.sacpa.entity.gerencia;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

@Entity
@Table(name = "gerente", schema = "gerencia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Gerente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gerente") private Integer idGerente;
    @Column(name = "cedula", length = 20) private String cedula;
    @Column(name = "nombres", length = 150) private String nombres;
    @Column(name = "apellidos", length = 150) private String apellidos;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "departamento", length = 100) private String departamento;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario") private Usuario usuario;
}
