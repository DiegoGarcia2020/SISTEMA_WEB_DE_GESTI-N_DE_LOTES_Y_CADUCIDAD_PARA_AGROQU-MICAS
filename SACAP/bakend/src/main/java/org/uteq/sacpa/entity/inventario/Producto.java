package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "producto", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto") private Integer idProducto;
    @Column(name = "nombre", nullable = false, length = 200) private String nombre;
    @Column(name = "descripcion", columnDefinition = "text") private String descripcion;
    @Column(name = "unidad_medida", length = 50) private String unidadMedida;
    @Column(name = "precio", precision = 10, scale = 2) private BigDecimal precio;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria") private Categoria categoria;
}
