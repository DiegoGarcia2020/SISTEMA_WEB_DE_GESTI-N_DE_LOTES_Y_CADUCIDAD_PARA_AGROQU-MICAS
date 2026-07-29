package org.uteq.sacpa.entity.catalogos;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cat_plaga", schema = "catalogos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatPlaga {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plaga") private Integer idPlaga;
    @Column(name = "nombre", nullable = false, length = 150) private String nombre;
    @Column(name = "id_estado") private Integer idEstado;
}
