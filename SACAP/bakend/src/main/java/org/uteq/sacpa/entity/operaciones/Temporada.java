package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Representa una temporada agrícola en el sistema.
 * Solo puede haber una temporada ACTIVA a la vez.
 */
@Entity
@Table(name = "temporada", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Temporada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_temporada")
    private Integer idTemporada;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
