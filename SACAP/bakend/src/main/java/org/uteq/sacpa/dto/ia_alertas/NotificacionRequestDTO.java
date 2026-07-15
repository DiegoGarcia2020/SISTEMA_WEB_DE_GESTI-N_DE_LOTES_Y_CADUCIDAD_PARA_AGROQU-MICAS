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
public class NotificacionRequestDTO {

    @NotBlank(message = "El canal es obligatorio (EMAIL, PUSH, IN_APP)")
    private String canal;

    @NotNull(message = "El ID de la alerta es obligatorio")
    private Integer idAlerta;

    @NotNull(message = "El ID del usuario destino es obligatorio")
    private Integer idUsuarioDestino;
}
