package org.uteq.sacpa.entity.operaciones;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.inventario.Producto;

import java.math.BigDecimal;

/**
 * Detalle de la Orden de Compra.
 * Cada fila representa un producto de la factura del proveedor.
 * Puede ser un ítem pagado normal o una bonificación (regalo a $0).
 *
 * Regla de negocio:
 *   - Si es_bonificacion = true → precio_unitario = 0, subtotal = 0
 *   - valor_descuento = (cantidad * precio_unitario) * (porcentaje_descuento / 100)
 *   - subtotal = (cantidad * precio_unitario) - valor_descuento
 */
@Entity
@Table(name = "detalle_compra", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden_compra", nullable = false)
    @JsonIgnore
    private OrdenCompra ordenCompra;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 10, scale = 2, nullable = false)
    private BigDecimal precioUnitario;

    /** Porcentaje de descuento aplicado a este ítem. Ej: 10.00 para un 10% */
    @Column(name = "porcentaje_descuento", precision = 5, scale = 2)
    private BigDecimal porcentajeDescuento;

    /** Valor monetario del descuento calculado por el backend */
    @Column(name = "valor_descuento", precision = 10, scale = 2)
    private BigDecimal valorDescuento;

    /** Subtotal neto de este ítem: (cantidad * precio_unitario) - valor_descuento */
    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    /** TRUE = Producto de regalo del proveedor (precio $0) */
    @Column(name = "es_bonificacion")
    private Boolean esBonificacion;
}
