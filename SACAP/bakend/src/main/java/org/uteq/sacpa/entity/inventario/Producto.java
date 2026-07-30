package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.uteq.sacpa.entity.catalogos.Toxicidad;
import org.uteq.sacpa.entity.catalogos.Formulacion;

@Entity
@Table(name = "producto", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto") private Integer idProducto;
    @Column(name = "nombre", nullable = false, length = 200) private String nombre;
    @Column(name = "descripcion", columnDefinition = "text") private String descripcion;
    @Column(name = "unidad_medida", length = 50) private String unidadMedida;
    @Column(name = "precio", precision = 10, scale = 2) private BigDecimal precio;
    @Column(name = "id_estado") private Integer idEstado;

    /** Cantidad mínima aceptable en inventario. Genera alerta de reabastecimiento si el stock cae por debajo */
    @Column(name = "stock_minimo") private Integer stockMinimo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria") private Categoria categoria;

    @Column(name = "ingrediente_activo", length = 200) private String ingredienteActivo;
    
    @Column(name = "periodo_carencia_dias") private Integer periodoCarenciaDias;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_toxicidad") private Toxicidad toxicidad;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_formulacion") private Formulacion formulacion;
}
