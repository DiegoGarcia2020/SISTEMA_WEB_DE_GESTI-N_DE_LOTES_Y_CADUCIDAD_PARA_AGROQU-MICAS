package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.catalogos.CatCultivo;
import org.uteq.sacpa.entity.catalogos.CatPlaga;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @Column(name = "instrucciones_aplicacion", columnDefinition = "text") private String instruccionesAplicacion;

    /** Cantidad mínima aceptable en inventario. Genera alerta de reabastecimiento si el stock cae por debajo */
    @Column(name = "stock_minimo") private Integer stockMinimo;

    @Column(name = "aplica_iva") private Boolean aplicaIva;
    @Column(name = "porcentaje_iva", precision = 5, scale = 2) private BigDecimal porcentajeIva;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria") private Categoria categoria;


    @Column(name = "ingrediente_activo", length = 200) private String ingredienteActivo;
    
    @Column(name = "periodo_carencia_dias") private Integer periodoCarenciaDias;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_toxicidad") private Toxicidad toxicidad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_formulacion") private Formulacion formulacion;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "producto_plaga", schema = "inventario",
            joinColumns = @JoinColumn(name = "id_producto"),
            inverseJoinColumns = @JoinColumn(name = "id_plaga"))
    private List<CatPlaga> plagas;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "producto_cultivo", schema = "inventario",
            joinColumns = @JoinColumn(name = "id_producto"),
            inverseJoinColumns = @JoinColumn(name = "id_cultivo"))
    private List<CatCultivo> cultivos;

}
