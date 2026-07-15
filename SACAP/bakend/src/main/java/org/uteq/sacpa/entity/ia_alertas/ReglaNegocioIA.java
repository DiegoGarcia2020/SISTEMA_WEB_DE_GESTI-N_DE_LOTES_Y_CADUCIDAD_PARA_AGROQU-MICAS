package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "regla_negocio_ia", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReglaNegocioIA {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_regla") private Integer idRegla;
    @Column(name = "descuento_maximo", precision = 5, scale = 2) private BigDecimal descuentoMaximo;
    @Column(name = "activar_promociones") private Boolean activarPromociones;
    @Column(name = "activo") private Boolean activo;
}
