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
public class ProductoSalvadoDTO {
    private Integer idLote;
    private String numeroLote;
    private String nombreProducto;
    private Integer cantidadAlertada;
    private Integer cantidadVendida;
    private LocalDate fechaVencimiento;
    private String nombreAlerta;
}
