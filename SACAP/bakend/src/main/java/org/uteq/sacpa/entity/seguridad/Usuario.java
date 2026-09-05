package org.uteq.sacpa.entity.seguridad;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "usuario", schema = "seguridad")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "correo", nullable = false, unique = true, length = 150)
    private String correo;

    @Column(name = "contrasena", nullable = false)
    private String contrasena;

    @Column(name = "id_estado", nullable = false)
    private Integer idEstado;

    @Column(name = "requiere_cambio_clave")
    private Boolean requiereCambioClave;


    @Transient
    private LocalDateTime fechaCreacion;

    @Transient
    private LocalDateTime fechaActualizacion;

    @Column(name = "nombres", length = 150)
    private String nombres;

    @Column(name = "apellidos", length = 150)
    private String apellidos;

    @Column(name = "cedula", length = 20)
    private String cedula;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "ocupacion", length = 150)
    private String ocupacion;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<UsuarioRol> roles;
}
