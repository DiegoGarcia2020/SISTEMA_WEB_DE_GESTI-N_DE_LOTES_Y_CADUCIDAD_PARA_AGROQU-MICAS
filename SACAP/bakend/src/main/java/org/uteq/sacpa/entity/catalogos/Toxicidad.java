package org.uteq.sacpa.entity.catalogos;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "toxicidad", schema = "catalogos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Toxicidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_toxicidad")
    private Integer idToxicidad;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "color_etiqueta", length = 50)
    private String colorEtiqueta;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}
