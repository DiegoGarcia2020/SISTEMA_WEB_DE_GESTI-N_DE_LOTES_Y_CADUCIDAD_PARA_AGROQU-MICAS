package org.uteq.sacpa.entity.geografia;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "provincia", schema = "geografia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Provincia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_provincia") private Integer idProvincia;
    @Column(name = "nombre", nullable = false, length = 150) private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pais") private Pais pais;
}
