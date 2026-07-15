package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "promociones", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Promocion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_promocion") private Integer idPromocion;
    @Column(name = "nombre_promocion", nullable = false, length = 200) private String nombrePromocion;
    @Column(name = "descripcion", columnDefinition = "text") private String descripcion;
    @Column(name = "descuento_global", precision = 5, scale = 2) private BigDecimal descuentoGlobal;
    @Column(name = "fecha_inicio") private LocalDate fechaInicio;
    @Column(name = "fecha_fin") private LocalDate fechaFin;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sugerencia") private SugerenciaIA sugerencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_aprueba") private Usuario usuarioAprueba;
}
