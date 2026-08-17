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
public class InventarioTotalDTO {
    private Integer idProducto;
    private String nombre;
    private String unidadMedida;
    private Long cantidadTotal;
    private BigDecimal precioUnitario;
    private BigDecimal valorTotal;
    private Integer lotesActivos;
}
