package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

@Entity
@Table(name = "bodeguero", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bodeguero {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bodeguero") private Integer idBodeguero;
    @Column(name = "cedula", length = 20) private String cedula;
    @Column(name = "nombres", length = 150) private String nombres;
    @Column(name = "apellidos", length = 150) private String apellidos;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "turno", length = 50) private String turno;
    @Column(name = "id_estado") private Integer idEstado;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario") private Usuario usuario;
}
