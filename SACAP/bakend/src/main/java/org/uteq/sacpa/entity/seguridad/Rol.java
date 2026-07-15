package org.uteq.sacpa.entity.seguridad;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "rol", schema = "seguridad")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "id_estado")
    private Integer idEstado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_rol_bd")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private RolBD rolBD;

    @OneToMany(mappedBy = "rol", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<RolPrivilegio> privilegios;
}
