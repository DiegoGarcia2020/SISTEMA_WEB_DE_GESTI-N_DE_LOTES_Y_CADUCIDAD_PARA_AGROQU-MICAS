package org.uteq.sacpa.entity.entidades;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.inventario.Producto;

import java.math.BigDecimal;

@Entity
@Table(name = "proveedor_producto", schema = "entidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProveedorProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor_producto")
    private Integer idProveedorProducto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "precio_referencial", precision = 10, scale = 2)
    private BigDecimal precioReferencial;

    @Column(name = "codigo_producto_proveedor", length = 50)
    private String codigoProductoProveedor;

    @Column(name = "id_estado", nullable = false)
    private Integer idEstado;
}
