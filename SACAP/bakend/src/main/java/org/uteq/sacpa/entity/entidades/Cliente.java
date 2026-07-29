package org.uteq.sacpa.entity.entidades;

import jakarta.persistence.*;
import lombok.*;

/** Finquero/cliente final al que el Técnico de Campo le vende. Sin cuenta de usuario. */
@Entity
@Table(name = "cliente", schema = "entidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente") private Integer idCliente;
    @Column(name = "nombre", nullable = false, length = 200) private String nombre;
    @Column(name = "cedula_ruc", length = 20) private String cedulaRuc;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "ubicacion_finca", columnDefinition = "text") private String ubicacionFinca;
    @Column(name = "id_estado") private Integer idEstado;
}
