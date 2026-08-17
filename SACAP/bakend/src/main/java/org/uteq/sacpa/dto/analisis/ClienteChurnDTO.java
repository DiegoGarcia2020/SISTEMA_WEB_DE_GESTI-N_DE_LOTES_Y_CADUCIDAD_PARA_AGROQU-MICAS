package org.uteq.sacpa.dto.analisis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteChurnDTO {
    private String cliente;
    private Long comprasAnteriores;
    private BigDecimal montoAnterior;
    private LocalDateTime ultimaCompra;
    private Long mesesSinCompra;
    private BigDecimal promedioMensual;
}
