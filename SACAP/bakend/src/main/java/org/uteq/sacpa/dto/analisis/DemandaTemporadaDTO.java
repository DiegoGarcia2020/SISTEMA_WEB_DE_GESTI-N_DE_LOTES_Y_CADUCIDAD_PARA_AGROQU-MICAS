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
public class DemandaTemporadaDTO {
    private Integer idProducto;
    private String nombre;
    private Long unidadesVendidas;
    private BigDecimal montoTotal;
    private String temporada;
    private Long totalUnidades;
    private BigDecimal totalMonto;
}
