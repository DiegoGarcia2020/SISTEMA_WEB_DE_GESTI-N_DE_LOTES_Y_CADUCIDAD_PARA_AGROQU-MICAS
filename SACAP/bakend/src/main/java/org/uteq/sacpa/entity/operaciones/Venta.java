package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;

import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.entity.seguridad.Usuario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tecnico", nullable = false)
    private Usuario tecnico;

    @Column(name = "numero_comprobante", nullable = false, length = 50)
    private String numeroComprobante;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "subtotal", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "iva_aplicado", precision = 10, scale = 2, nullable = false)
    private BigDecimal ivaAplicado;

    @Column(name = "total", precision = 10, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado; // e.g., 'CONFIRMADA'

    @Column(name = "descuento_total", precision = 10, scale = 2)
    private BigDecimal descuentoTotal;

    // Nuevos campos de Logística y Pagos (Smart POS)
    @Column(name = "costo_envio", precision = 10, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "metodo_pago", length = 30)
    private String metodoPago;

    @Column(name = "referencia_pago", length = 100)
    private String referenciaPago;

    @Column(name = "fecha_estimada_entrega")
    private java.time.LocalDate fechaEstimadaEntrega;

    @Column(name = "ventana_horaria", length = 50)
    private String ventanaHoraria;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DetalleVenta> detalles = new ArrayList<>();

    public void agregarDetalle(DetalleVenta detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }
}
