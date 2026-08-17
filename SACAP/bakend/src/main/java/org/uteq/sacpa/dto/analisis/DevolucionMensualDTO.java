package org.uteq.sacpa.dto.analisis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevolucionMensualDTO {
    private Integer anio;
    private Integer mes;
    private String nombreMes;
    private Long totalDevoluciones;
    private Integer cantidadTotal;
    private String motivoPrincipal;
}
