package org.uteq.sacpa.dto.analisis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoEstancadoDTO {
    private Integer idProducto;
    private String nombre;
    private Integer cantidadActual;
    private LocalDateTime ultimoMovimiento;
    private Long diasSinMovimiento;
    private String ubicacion;
}
