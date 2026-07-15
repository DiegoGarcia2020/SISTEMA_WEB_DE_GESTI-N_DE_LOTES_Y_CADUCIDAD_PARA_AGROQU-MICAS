package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.catalogos.CatNivelAlerta;
import org.uteq.sacpa.entity.inventario.Lote;
import java.time.LocalDateTime;

/**
 * ENTIDAD CORE DEL SISTEMA SACPA.
 * Alerta generada cuando un lote esta proximo a vencer.
 *
 * Funcion BD: ia_alertas.fn_crear_alerta_caducidad(
 *   p_mensaje, p_id_lote, p_id_nivel_alerta, p_id_estado
 * )
 * Funcion BD: ia_alertas.fn_descartar_alerta_caducidad(
 *   p_id_alerta, p_id_estado_descartado
 * )
 */
@Entity
@Table(name = "alertas_caducidad", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertaCaducidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta")
    private Integer idAlerta;

    @Column(name = "mensaje", columnDefinition = "text")
    private String mensaje;

    @Column(name = "fecha_generacion")
    private LocalDateTime fechaGeneracion;

    @Column(name = "id_estado")
    private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote")
    private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nivel_alerta")
    private CatNivelAlerta nivelAlerta;
}
