package org.uteq.sacpa.entity.entidades;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

/**
 * Representa un cliente (dueño de finca) al que el Técnico-Comercial
 * le genera Órdenes de Pedido de agroquímicos.
 */
@Entity
@Table(name = "clientes", schema = "entidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;

    @Column(name = "nombre_finca", nullable = false, length = 200)
    private String nombreFinca;

    /** Cédula de identidad del dueño de la finca (10 dígitos Ecuador) */
    @Column(name = "cedula", nullable = false, unique = true, length = 13)
    private String cedula;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "direccion", length = 300)
    private String direccion;

    @Column(name = "id_estado")
    private Integer idEstado;

    /** Técnico-Comercial asignado a esta finca/cliente */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tecnico_asignado")
    private Usuario tecnicoAsignado;
}
