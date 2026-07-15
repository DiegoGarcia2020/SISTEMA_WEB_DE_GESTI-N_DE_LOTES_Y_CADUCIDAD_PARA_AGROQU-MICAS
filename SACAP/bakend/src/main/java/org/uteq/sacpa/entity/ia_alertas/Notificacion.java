package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notificacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion") private Integer idNotificacion;
    @Column(name = "canal", length = 50) private String canal; // EMAIL, PUSH, SISTEMA
    @Column(name = "fecha_envio") private LocalDateTime fechaEnvio;
    @Column(name = "leida") private Boolean leida;
    @Column(name = "fecha_lectura") private LocalDateTime fechaLectura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_alerta") private AlertaCaducidad alerta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_destino") private Usuario usuarioDestino;
}
