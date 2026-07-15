package org.uteq.sacpa.entity.seguridad;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_sesion", schema = "seguridad")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long idSesion;

    @Column(name = "ip_acceso", length = 50)
    private String ipAcceso;

    @Column(name = "fecha_ingreso")
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_salida")
    private LocalDateTime fechaSalida;

    @Column(name = "rol_utilizado", length = 100)
    private String rolUtilizado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;
}
