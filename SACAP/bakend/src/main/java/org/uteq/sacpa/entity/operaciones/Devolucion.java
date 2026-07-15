package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.seguridad.Usuario;
import java.time.LocalDateTime;

@Entity
@Table(name = "devoluciones", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Devolucion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_devolucion") private Integer idDevolucion;
    @Column(name = "motivo", columnDefinition = "text") private String motivo;
    @Column(name = "cantidad") private Integer cantidad;
    @Column(name = "fecha_devolucion") private LocalDateTime fechaDevolucion;
    @Column(name = "id_estado_aprobacion") private Integer idEstadoAprobacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor") private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_supervisor") private Usuario supervisor;
}
