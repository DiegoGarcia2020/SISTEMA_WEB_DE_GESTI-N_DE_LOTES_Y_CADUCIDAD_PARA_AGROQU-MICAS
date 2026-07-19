package org.uteq.sacpa.entity.entidades;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

@Entity
@Table(name = "proveedor", schema = "entidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Proveedor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor") private Integer idProveedor;
    @Column(name = "nombre_representante", nullable = false, length = 200) private String nombre;
    @Column(name = "ruc", length = 20) private String ruc;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "direccion", length = 300) private String direccion;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario") private Usuario usuario;
}
