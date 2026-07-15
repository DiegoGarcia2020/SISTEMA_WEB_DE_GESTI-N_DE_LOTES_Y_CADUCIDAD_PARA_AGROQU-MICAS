package org.uteq.sacpa.dto.ia_alertas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertaRequestDTO {

    @NotBlank(message = "El mensaje de la alerta es obligatorio")
    private String mensaje;

    @NotNull(message = "El ID del lote es obligatorio")
    private Integer idLote;

    @NotNull(message = "El ID del nivel de alerta es obligatorio")
    private Integer idNivelAlerta;

    @NotNull(message = "El ID del estado es obligatorio")
    private Integer idEstado;
}
