package org.uteq.sacpa.entity.catalogos;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cat_nivel_alerta", schema = "catalogos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatNivelAlerta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nivel_alerta") private Integer idNivelAlerta;
    @Column(name = "nombre", nullable = false, length = 100) private String nombre;
    @Column(name = "activo") private Boolean activo;
}
