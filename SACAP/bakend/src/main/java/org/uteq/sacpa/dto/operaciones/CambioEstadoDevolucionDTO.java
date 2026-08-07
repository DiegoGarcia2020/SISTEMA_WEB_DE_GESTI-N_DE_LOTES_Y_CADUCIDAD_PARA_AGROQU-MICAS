package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambioEstadoDevolucionDTO {

    @NotNull(message = "El nuevo estado de aprobación es obligatorio (1: Aprobado, 2: Pendiente, 3: Rechazado)")
    private Integer idEstadoAprobacion;

    private String observacionSupervisor;
}
