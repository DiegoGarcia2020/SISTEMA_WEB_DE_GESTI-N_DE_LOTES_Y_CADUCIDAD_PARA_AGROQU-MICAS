package org.uteq.sacpa.entity.catalogos;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cat_estado_general", schema = "catalogos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatEstadoGeneral {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado") private Integer idEstado;
    @Column(name = "nombre", nullable = false, length = 100) private String nombre;
    @Column(name = "activo") private Boolean activo;
}
