package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.catalogos.CatTipoMovimiento;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.seguridad.Usuario;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_inventario", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MovimientoInventario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento") private Integer idMovimiento;
    @Column(name = "cantidad") private Integer cantidad;
    @Column(name = "observacion", columnDefinition = "text") private String observacion;
    @Column(name = "fecha_movimiento") private LocalDateTime fechaMovimiento;
    @Column(name = "id_estado_aprobacion") private Integer idEstadoAprobacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_movimiento") private CatTipoMovimiento tipoMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario") private Usuario usuario;
}
