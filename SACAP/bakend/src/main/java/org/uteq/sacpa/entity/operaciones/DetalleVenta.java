package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.inventario.Producto;

import java.math.BigDecimal;

@Entity
@Table(name = "detalle_ventas", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta", nullable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 10, scale = 2, nullable = false)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "es_sugerencia_ia", nullable = false)
    @Builder.Default
    private Boolean esSugerenciaIa = false;
}
