package org.uteq.sacpa.dto.operaciones;

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
public class ProductoCatalogoDTO {
    private Integer idProducto;
    private String nombre;
    private String descripcion;
    private String unidadMedida;
    private BigDecimal precio;
    private Integer stockDisponible;
    private LocalDate proximaCaducidad;
}
