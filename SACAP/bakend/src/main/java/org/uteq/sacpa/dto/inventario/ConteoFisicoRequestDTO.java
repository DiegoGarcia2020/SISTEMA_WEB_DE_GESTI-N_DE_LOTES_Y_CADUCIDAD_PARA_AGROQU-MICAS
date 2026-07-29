package org.uteq.sacpa.dto.inventario;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConteoFisicoRequestDTO {
    @NotNull(message = "El ID de ubicación es obligatorio")
    private Integer idUbicacion;

    @NotNull(message = "El conteo físico real es obligatorio")
    @Min(value = 0, message = "El conteo físico no puede ser negativo")
    private Integer conteoFisico;

    private String observaciones;
}
