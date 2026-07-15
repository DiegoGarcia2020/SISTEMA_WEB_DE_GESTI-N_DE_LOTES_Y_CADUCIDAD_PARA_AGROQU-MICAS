package org.uteq.sacpa.dto.ia_modelos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemporadaRequestDTO {

    @NotBlank(message = "El nombre de la temporada es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @NotNull(message = "El ID de la region (provincia) es obligatorio")
    private Integer idRegion;

    @NotNull(message = "El ID del estado es obligatorio")
    private Integer idEstado;
}
