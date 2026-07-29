package org.uteq.sacpa.dto.ia_modelos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TemporadaResponseDTO {
    private Integer idTemporada;
    private String nombre;
    private String cultivo;
    private LocalDate fechaInicio;
    private LocalDate fechaFinProyectada;
    private String estado;
    private Integer progresoPorcentaje;

    public static TemporadaResponseDTO from(TemporadaAgricola t) {
        int progreso = 0;
        if (t.getFechaInicio() != null && t.getFechaFin() != null) {
            long total = ChronoUnit.DAYS.between(t.getFechaInicio(), t.getFechaFin());
            long transcurridos = ChronoUnit.DAYS.between(t.getFechaInicio(), LocalDate.now());
            if (total > 0) {
                progreso = (int) Math.max(0, Math.min(100, Math.round(100.0 * transcurridos / total)));
            }
        }
        return TemporadaResponseDTO.builder()
                .idTemporada(t.getIdTemporada())
                .nombre(t.getNombreTemporada())
                .cultivo(t.getCultivo())
                .fechaInicio(t.getFechaInicio())
                .fechaFinProyectada(t.getFechaFin())
                .estado(t.getEstado() != null ? t.getEstado().getNombre() : null)
                .progresoPorcentaje(progreso)
                .build();
    }
}
