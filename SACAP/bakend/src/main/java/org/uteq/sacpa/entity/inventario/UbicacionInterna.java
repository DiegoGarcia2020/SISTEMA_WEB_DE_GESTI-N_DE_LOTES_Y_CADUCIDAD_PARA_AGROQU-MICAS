package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ubicacion_interna", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UbicacionInterna {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ubicacion") private Integer idUbicacion;
    @Column(name = "nivel", length = 50) private String nivel;
    @Column(name = "posicion", length = 50) private String posicion;
    @Column(name = "id_estado") private Integer idEstado;
    @Column(name = "capacidad_maxima") private Integer capacidadMaxima;
    @Column(name = "capacidad_actual") private Integer capacidadActual;
    @Column(name = "codigo_qr", length = 100) private String codigoQr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estanteria") private Estanteria estanteria;
}
