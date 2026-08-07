package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemporadaResponseDTO {
    
    private Integer idTemporada;
    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    private LocalDateTime fechaCreacion;
}
