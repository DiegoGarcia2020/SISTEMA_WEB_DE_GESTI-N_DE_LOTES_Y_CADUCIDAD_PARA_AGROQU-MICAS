package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.catalogos.CatEstadoVenta;
import org.uteq.sacpa.entity.entidades.Cliente;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Cabecera de una venta del Técnico de Campo (Módulo 3 - Motor IA). Al confirmarse reserva stock; el despacho físico lo hace el Bodeguero. */
@Entity
@Table(name = "venta", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VentaIA {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venta") private Integer idVenta;
    @Column(name = "numero_orden", nullable = false, unique = true, length = 30) private String numeroOrden;
    @Column(name = "fecha_venta") private LocalDateTime fechaVenta;
    @Column(name = "subtotal", precision = 10, scale = 2) private BigDecimal subtotal;
    @Column(name = "descuento_total", precision = 10, scale = 2) private BigDecimal descuentoTotal;
    @Column(name = "total", precision = 10, scale = 2) private BigDecimal total;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente") private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tecnico") private TecnicoCampo tecnico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado") private CatEstadoVenta estado;
}
