package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Lectura de temperatura/humedad de una zona de bodega (Resolución 0227,
 * Anexo 1 punto 20). Conservar como bitácora histórica: no se expone borrado.
 */
@Entity
@Table(name = "registro_temperatura", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroTemperatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private Integer idRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_zona", nullable = false)
    private ZonaAlmacen zona;

    @Column(name = "temperatura", precision = 5, scale = 2, nullable = false)
    private BigDecimal temperatura;

    @Column(name = "humedad_relativa", precision = 5, scale = 2)
    private BigDecimal humedadRelativa;

    @Column(name = "fuera_de_rango", nullable = false)
    private Boolean fueraDeRango;

    @Column(name = "observaciones", length = 300)
    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_registro", nullable = false)
    private Usuario usuarioRegistro;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
}
