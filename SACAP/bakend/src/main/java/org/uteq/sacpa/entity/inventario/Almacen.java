package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.geografia.Ciudad;

import java.math.BigDecimal;

@Entity
@Table(name = "almacen", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Almacen {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_almacen") private Integer idAlmacen;
    @Column(name = "nombre", nullable = false, length = 200) private String nombre;
    @Column(name = "capacidad_total", precision = 12, scale = 2) private BigDecimal capacidadTotal;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ciudad") private Ciudad ciudad;
}
