package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.inventario.Producto;

@Entity
@Table(name = "promocion_detalle", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PromocionDetalle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle") private Integer idDetalle;
    @Column(name = "cantidad_requerida") private Integer cantidadRequerida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_promocion") private Promocion promocion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto") private Producto producto;
}
