package org.uteq.sacpa.dto.analisis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromocionExitoDTO {
    private Integer idPromocion;
    private String nombre;
    private BigDecimal descuentoGlobal;
    private String estado;
    private Integer totalAprobadas;
    private Integer totalSugeridas;
    private Integer totalActivas;
    private Double porcentajeAprobacion;
}
