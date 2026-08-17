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
public class ProductoTemporadaDTO {
    private Integer idProducto;
    private String nombre;
    private String temporada;
    private Long unidadesVendidas;
    private BigDecimal montoTotal;
    private Long totalUnidadesTemporada;
    private Double porcentajeParticipacion;
}
