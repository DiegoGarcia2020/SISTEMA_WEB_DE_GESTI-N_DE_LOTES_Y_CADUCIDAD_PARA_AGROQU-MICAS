package org.uteq.sacpa.entity.catalogos;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cat_tipo_movimiento", schema = "catalogos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatTipoMovimiento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_movimiento") private Integer idTipoMovimiento;
    @Column(name = "nombre", nullable = false, length = 100) private String nombre;
    @Column(name = "naturaleza", length = 50) private String naturaleza; // ENTRADA, SALIDA, TRASLADO
    @Column(name = "activo") private Boolean activo;
}
