package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "modelo_ia", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ModeloIA {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modelo") private Integer idModelo;
    @Column(name = "nombre_modelo", nullable = false, length = 200) private String nombreModelo;
    @Column(name = "version", length = 50) private String version;
    @Column(name = "descripcion", columnDefinition = "text") private String descripcion;
    @Column(name = "activo") private Boolean activo;
}
