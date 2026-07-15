package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ejecucion_ia", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EjecucionIA {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ejecucion") private Integer idEjecucion;
    @Column(name = "parametros_enviados", columnDefinition = "text") private String parametrosEnviados;
    @Column(name = "fecha_ejecucion") private LocalDateTime fechaEjecucion;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modelo") private ModeloIA modelo;
}
