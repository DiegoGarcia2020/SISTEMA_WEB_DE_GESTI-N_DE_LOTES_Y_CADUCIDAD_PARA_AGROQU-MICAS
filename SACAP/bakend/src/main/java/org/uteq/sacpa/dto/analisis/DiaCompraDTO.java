package org.uteq.sacpa.dto.analisis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiaCompraDTO {
    private Integer diaSemana;
    private String nombreDia;
    private Long totalVentas;
    private BigDecimal montoTotal;
    private Long totalUnidades;
}
