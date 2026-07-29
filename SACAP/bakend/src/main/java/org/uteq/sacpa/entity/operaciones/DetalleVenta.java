package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.ia_alertas.Promocion;
import org.uteq.sacpa.entity.inventario.Lote;

import java.math.BigDecimal;

/** Línea de una Venta: un lote específico (no solo el producto) para respetar FEFO y la reserva de stock. */
@Entity
@Table(name = "detalle_venta", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleVenta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle") private Integer idDetalle;
    @Column(name = "cantidad", nullable = false) private Integer cantidad;
    @Column(name = "precio_unitario", precision = 10, scale = 2) private BigDecimal precioUnitario;
    @Column(name = "subtotal_linea", precision = 10, scale = 2) private BigDecimal subtotalLinea;
    @Column(name = "es_combo_ia") private Boolean esComboIA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta") private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promocion") private Promocion promocion;
}
