package org.uteq.sacpa.entity.catalogos;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cat_estado_aprobacion", schema = "catalogos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatEstadoAprobacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_aprobacion") private Integer idEstadoAprobacion;
    @Column(name = "nombre", nullable = false, length = 100) private String nombre;
    @Column(name = "activo") private Boolean activo;
}
