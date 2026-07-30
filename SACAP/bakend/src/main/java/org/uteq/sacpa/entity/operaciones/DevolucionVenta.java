package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.inventario.Lote;

import java.time.LocalDateTime;

@Entity
@Table(name = "devoluciones_venta", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DevolucionVenta {

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

    @Column(name = "cantidad_devuelta", nullable = false)
    private Integer cantidadDevuelta;

    @Column(name = "motivo", length = 50, nullable = false)
    private String motivo; // Ej: MALOGRADO, ARREPENTIMIENTO_SALDO

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(name = "estado_logistico", length = 30, nullable = false)
    private String estadoLogistico; // Ej: EN_TRANSITO, RECIBIDO_BODEGA

    @Column(name = "estado_inventario", length = 30)
    private String estadoInventario; // Ej: CUARENTENA, DISPONIBLE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote")
    private Lote lote;
}
