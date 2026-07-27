package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.catalogos.CatEstadoTemporada;
import java.time.LocalDate;

@Entity
@Table(name = "temporadas_agricolas", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TemporadaAgricola {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_temporada") private Integer idTemporada;
    @Column(name = "nombre_temporada", nullable = false, length = 150) private String nombreTemporada;
    @Column(name = "cultivo", length = 150) private String cultivo;
    @Column(name = "fecha_inicio") private LocalDate fechaInicio;
    @Column(name = "fecha_fin") private LocalDate fechaFin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado") private CatEstadoTemporada estado;
}
