package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "categoria", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Categoria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria") private Integer idCategoria;
    @Column(name = "nombre", nullable = false, length = 150) private String nombre;
    @Column(name = "id_estado") private Integer idEstado;
}
