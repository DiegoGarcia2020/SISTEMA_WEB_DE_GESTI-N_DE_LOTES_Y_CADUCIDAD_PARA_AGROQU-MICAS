package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Cabecera de venta. Pregunta #1: "Productos más vendidos esta semana".
 * Registrada por operaciones.fn_registrar_venta.
 */
@Entity
@Table(name = "venta", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta")
    private Integer idVenta;

    @Column(name = "fecha_venta", nullable = false)
    private LocalDateTime fechaVenta;

    @Column(name = "id_usuario", nullable = false)
    private Integer idUsuario;

    @Column(name = "cliente", length = 150)
    private String cliente;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "iva", precision = 12, scale = 2)
    private BigDecimal iva;

    @Column(name = "total", precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "id_estado_aprobacion", nullable = false)
    private Integer idEstadoAprobacion;
}
