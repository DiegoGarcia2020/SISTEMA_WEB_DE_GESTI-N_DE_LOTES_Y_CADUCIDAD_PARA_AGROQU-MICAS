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
public class ClienteFrecuenteDTO {
    private String cliente;
    private Long totalCompras;
    private BigDecimal montoTotal;
    private BigDecimal promedioCompra;
    private LocalDateTime ultimaCompra;
}
