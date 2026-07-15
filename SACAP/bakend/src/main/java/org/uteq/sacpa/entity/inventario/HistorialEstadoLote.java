package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estado_lote", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialEstadoLote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial") private Integer idHistorial;
    @Column(name = "id_estado_anterior") private Integer idEstadoAnterior;
    @Column(name = "id_estado_nuevo") private Integer idEstadoNuevo;
    @Column(name = "observacion", columnDefinition = "text") private String observacion;
    @Column(name = "fecha_cambio") private LocalDateTime fechaCambio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario") private Usuario usuarioCambio;
}
