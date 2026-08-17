package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.inventario.Producto;

import java.math.BigDecimal;

/**
 * Detalle / línea de venta. Pregunta #1: "Productos más vendidos esta semana".
 */
@Entity
@Table(name = "detalle_venta", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Integer idDetalle;

    @Column(name = "id_venta", nullable = false)
    private Integer idVenta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "id_lote")
    private Integer idLote;
}
