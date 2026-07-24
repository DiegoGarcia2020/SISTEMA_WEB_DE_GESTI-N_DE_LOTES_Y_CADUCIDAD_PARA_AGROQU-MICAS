package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.entidades.Proveedor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ENTIDAD PRINCIPAL DEL SISTEMA SACPA.
 * Representa un lote de productos agricolas con fecha de vencimiento.
 * Las alertas de caducidad se generan en base a esta fecha.
 *
 * Funcion BD: inventario.fn_crear_lote(
 *   p_numero_lote, p_fecha_fabricacion, p_fecha_vencimiento,
 *   p_cantidad_inicial, p_id_producto, p_id_proveedor,
 *   p_id_ubicacion, p_id_estado_lote
 * )
 */
@Entity
@Table(name = "lotes", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lote")
    private Integer idLote;

    @Column(name = "numero_lote", nullable = false, unique = true, length = 100)
    private String numeroLote;

    @Column(name = "fecha_fabricacion")
    private LocalDate fechaFabricacion;

    /** Campo clave para el sistema de alertas de caducidad */
    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "cantidad_inicial")
    private Integer cantidadInicial;

    @Column(name = "cantidad_actual")
    private Integer cantidadActual;

    /**
     * Unidades reservadas por pedidos pendientes de despacho.
     * Stock disponible real = cantidadActual - cantidadReservada.
     */
    @Column(name = "cantidad_reservada")
    private Integer cantidadReservada;

    @Column(name = "fecha_ingreso")
    private LocalDateTime fechaIngreso;

    @Column(name = "id_estado_lote")
    private Integer idEstadoLote;

    /**
     * Costo real promedio del producto en este lote.
     * Si la compra incluye bonificaciones (regalos), el costo se distribuye
     * entre todas las unidades (pagadas + regaladas).
     * Ej: 100 a $10 + 10 regalo = $1000 / 110 = $9.09 c/u.
     */
    @Column(name = "costo_unitario_real", precision = 10, scale = 2)
    private BigDecimal costoUnitarioReal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor")
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ubicacion")
    private UbicacionInterna ubicacion;

    /** Referencia a la orden de compra que originó este lote */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden_compra")
    private org.uteq.sacpa.entity.operaciones.OrdenCompra ordenCompra;
}
