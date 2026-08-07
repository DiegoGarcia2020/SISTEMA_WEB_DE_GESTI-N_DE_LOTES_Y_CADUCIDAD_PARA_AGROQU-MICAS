package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.seguridad.Usuario;
import java.time.LocalDate;

/**
 * Entidad polivalente:
 *  - tipo_registro = 'USO_CAMPO'    → registro clásico de aplicación agrícola
 *  - tipo_registro = 'ORDEN_PEDIDO' → pedido de venta generado por el Técnico-Comercial
 *
 * Cuando es ORDEN_PEDIDO, los campos id_cliente, descripcion_plaga,
 * id_estado_pedido y cantidad_reservada son relevantes.
 */
@Entity
@Table(name = "uso_campo", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UsoCampo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_uso") private Integer idUso;

    // ── Campos originales (uso agrícola clásico) ──────────────────────────
    @Column(name = "parcela", length = 150) private String parcela;
    @Column(name = "cultivo", length = 150) private String cultivo;
    @Column(name = "fecha_aplicacion") private LocalDate fechaAplicacion;
    @Column(name = "cantidad_usada") private Integer cantidadUsada;
    @Column(name = "observacion", columnDefinition = "text") private String observacion;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_tecnico") private Usuario tecnico;

    // ── Campos nuevos para flujo de Orden de Pedido (ventas) ──────────────

    /** Cliente/Finca destino del pedido. Null si es uso agrícola clásico. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente") private Cliente cliente;

    /** Diagnóstico del técnico: descripción de la plaga o problema detectado. */
    @Column(name = "descripcion_plaga", length = 500) private String descripcionPlaga;

    /**
     * Tipo de registro:
     *   'USO_CAMPO'    → aplicación agrícola (comportamiento original)
     *   'ORDEN_PEDIDO' → pedido comercial de venta
     */
    @Column(name = "tipo_registro", length = 50)
    private String tipoRegistro;

    /**
     * Estado del flujo del pedido (solo cuando tipo_registro = 'ORDEN_PEDIDO'):
     *   1 = PENDIENTE_BODEGA
     *   2 = DESPACHADO
     *   3 = ENTREGADO
     *   4 = CANCELADO
     *   5 = DEVUELTO
     */
    @Column(name = "id_estado_pedido") private Integer idEstadoPedido;

    /** Referencia al combo/promo IA que el técnico usó para generar el pedido. */
    @Column(name = "id_combo_aplicado") private Integer idComboAplicado;

    /**
     * Unidades reservadas del lote cuando se crea el pedido.
     * Se libera a 0 cuando el bodeguero despacha.
     */
    @Column(name = "cantidad_reservada") private Integer cantidadReservada;
}
