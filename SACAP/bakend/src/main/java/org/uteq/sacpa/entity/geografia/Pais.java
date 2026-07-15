package org.uteq.sacpa.entity.geografia;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pais", schema = "geografia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pais {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pais") private Integer idPais;
    @Column(name = "nombre", nullable = false, length = 150) private String nombre;
    @Column(name = "codigo_iso", length = 10) private String codigoIso;
}
