package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ubicacion_interna", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UbicacionInterna {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ubicacion") private Integer idUbicacion;
    @Column(name = "nivel", length = 50) private String nivel;
    @Column(name = "posicion", length = 50) private String posicion;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estanteria") private Estanteria estanteria;
}
