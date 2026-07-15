package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.catalogos.CatEstadoAprobacion;
import org.uteq.sacpa.entity.inventario.Lote;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sugerencias_ia", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SugerenciaIA {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sugerencia") private Integer idSugerencia;
    @Column(name = "porcentaje_descuento", precision = 5, scale = 2) private BigDecimal porcentajeDescuento;
    @Column(name = "observaciones", columnDefinition = "text") private String observaciones;
    @Column(name = "fecha_sugerencia") private LocalDateTime fechaSugerencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_temporada") private TemporadaAgricola temporada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ejecucion") private EjecucionIA ejecucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado_aprobacion") private CatEstadoAprobacion estadoAprobacion;
}
