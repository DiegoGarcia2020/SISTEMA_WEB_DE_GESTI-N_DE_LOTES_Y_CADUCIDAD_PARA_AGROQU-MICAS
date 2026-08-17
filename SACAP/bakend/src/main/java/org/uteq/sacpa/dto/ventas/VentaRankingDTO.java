package org.uteq.sacpa.dto.ventas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaRankingDTO {

    private Integer idProducto;
    private String nombre;
    private Long unidades;
    private BigDecimal montoTotal;
    private Long unidadesAnterior;
    private Double variacion;
}
