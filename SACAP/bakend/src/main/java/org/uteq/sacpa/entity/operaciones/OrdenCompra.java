package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.entidades.Proveedor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Cabecera de la Orden de Compra.
 * Representa la transcripción de la factura física del proveedor al sistema.
 * El Supervisor es quien registra esta información.
 *
 * Estados posibles:
 *   PENDIENTE     → Factura registrada, esperando recepción física del Bodeguero.
 *   RECEPCIONADA  → Bodeguero confirmó ingreso y se generaron los lotes.
 *   ANULADA       → Orden cancelada.
 */
@Entity
@Table(name = "orden_compra", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @Column(name = "numero_factura", nullable = false, length = 50)
    private String numeroFactura;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    /** Suma de (cantidad * precio_unitario) de ítems NO bonificación, ANTES de descuentos */
    @Column(name = "subtotal_bruto", precision = 10, scale = 2)
    private BigDecimal subtotalBruto;

    /** Suma total de todos los descuentos por ítem */
    @Column(name = "total_descuentos", precision = 10, scale = 2)
    private BigDecimal totalDescuentos;

    /** Costo del flete/envío. Ingresado manualmente por el Supervisor */
    @Column(name = "costo_transporte", precision = 10, scale = 2)
    private BigDecimal costoTransporte;

    @Column(name = "impuestos", precision = 10, scale = 2)
    private BigDecimal impuestos;

    /** Total real a pagar: subtotal_bruto - total_descuentos + costo_transporte + impuestos */
    @Column(name = "total_neto", precision = 10, scale = 2)
    private BigDecimal totalNeto;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    /**
     * Relación con los detalles (productos) de esta orden de compra.
     * CascadeType.ALL permite guardar la cabecera y detalles en una sola transacción.
     * orphanRemoval elimina detalles huérfanos si se remueven de la lista.
     */
    @OneToMany(mappedBy = "ordenCompra", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DetalleCompra> detalles = new ArrayList<>();

    /**
     * Método helper para agregar un detalle manteniendo la bidireccionalidad.
     */
    public void agregarDetalle(DetalleCompra detalle) {
        detalles.add(detalle);
        detalle.setOrdenCompra(this);
    }
}
