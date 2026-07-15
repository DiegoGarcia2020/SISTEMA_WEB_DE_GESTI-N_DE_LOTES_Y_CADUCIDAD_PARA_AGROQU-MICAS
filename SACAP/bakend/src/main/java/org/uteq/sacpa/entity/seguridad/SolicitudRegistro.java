package org.uteq.sacpa.entity.seguridad;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud_registro", schema = "seguridad")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SolicitudRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @Column(name = "correo", nullable = false, length = 150)
    private String correo;

    @Column(name = "nombres", nullable = false, length = 150)
    private String nombres;

    @Column(name = "apellidos", nullable = false, length = 150)
    private String apellidos;

    @Column(name = "cedula", nullable = false, length = 20)
    private String cedula;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @Column(name = "cargo", length = 100)
    private String cargo;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "id_estado")
    private Integer idEstado; // 1 = PENDIENTE, 2 = APROBADA, 3 = RECHAZADA

    @Column(name = "motivo_rechazo", columnDefinition = "text")
    private String motivoRechazo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procesado_por")
    private Usuario procesadoPor;

    @Column(name = "fecha_procesamiento")
    private LocalDateTime fechaProcesamiento;
}
