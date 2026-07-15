package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.seguridad.Usuario;
import java.time.LocalDate;

@Entity
@Table(name = "uso_campo", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UsoCampo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_uso") private Integer idUso;
    @Column(name = "parcela", length = 150) private String parcela;
    @Column(name = "cultivo", length = 150) private String cultivo;
    @Column(name = "fecha_aplicacion") private LocalDate fechaAplicacion;
    @Column(name = "cantidad_usada") private Integer cantidadUsada;
    @Column(name = "observacion", columnDefinition = "text") private String observacion;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_tecnico") private Usuario tecnico;
}
