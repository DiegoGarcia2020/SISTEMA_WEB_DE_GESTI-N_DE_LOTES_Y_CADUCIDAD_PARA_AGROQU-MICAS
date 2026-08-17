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
public class MovimientoProductoDTO {
    private Integer idMovimiento;
    private String nombreProducto;
    private String numeroLote;
    private String tipoMovimiento;
    private String naturaleza;
    private Integer cantidad;
    private LocalDateTime fechaMovimiento;
    private String usuario;
    private String observacion;
}
