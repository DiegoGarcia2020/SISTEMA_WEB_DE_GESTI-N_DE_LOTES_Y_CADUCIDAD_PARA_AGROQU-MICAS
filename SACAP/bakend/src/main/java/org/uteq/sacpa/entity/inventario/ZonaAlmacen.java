package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zona_almacen", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ZonaAlmacen {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_zona") private Integer idZona;
    @Column(name = "nombre", nullable = false, length = 150) private String nombre;
    @Column(name = "condicion_climatica", length = 100) private String condicionClimatica;
    @Column(name = "id_estado") private Integer idEstado;
    @Column(name = "es_cuarentena", nullable = false) @Builder.Default private Boolean esCuarentena = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_almacen") private Almacen almacen;
}
