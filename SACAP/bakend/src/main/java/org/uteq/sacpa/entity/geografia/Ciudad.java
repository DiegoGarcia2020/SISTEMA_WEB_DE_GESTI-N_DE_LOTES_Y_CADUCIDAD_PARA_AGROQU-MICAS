package org.uteq.sacpa.entity.geografia;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ciudad", schema = "geografia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ciudad {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ciudad") private Integer idCiudad;
    @Column(name = "nombre", nullable = false, length = 150) private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_provincia") private Provincia provincia;
}
