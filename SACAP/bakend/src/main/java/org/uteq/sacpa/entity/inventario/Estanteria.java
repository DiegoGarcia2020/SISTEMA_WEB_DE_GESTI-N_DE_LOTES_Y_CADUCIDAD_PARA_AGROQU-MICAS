package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "estanteria", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Estanteria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estanteria") private Integer idEstanteria;
    @Column(name = "codigo", nullable = false, length = 50) private String codigo;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_zona") private ZonaAlmacen zona;
}
