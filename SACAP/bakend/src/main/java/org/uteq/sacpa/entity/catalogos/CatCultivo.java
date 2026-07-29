package org.uteq.sacpa.entity.catalogos;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cat_cultivo", schema = "catalogos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatCultivo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cultivo") private Integer idCultivo;
    @Column(name = "nombre", nullable = false, length = 150) private String nombre;
    @Column(name = "id_estado") private Integer idEstado;
}
