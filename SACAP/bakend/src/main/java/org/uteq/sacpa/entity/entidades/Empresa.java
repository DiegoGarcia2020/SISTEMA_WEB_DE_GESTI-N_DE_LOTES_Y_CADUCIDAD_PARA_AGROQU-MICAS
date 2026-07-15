package org.uteq.sacpa.entity.entidades;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "empresa", schema = "entidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Empresa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa") private Integer idEmpresa;
    @Column(name = "nombre", nullable = false, length = 200) private String nombre;
    @Column(name = "ruc", length = 20) private String ruc;
    @Column(name = "direccion", length = 300) private String direccion;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "correo", length = 150) private String correo;
}
