package org.uteq.sacpa.dto.entidades;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorProductoDTO {
    
    private Integer idProveedorProducto;

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Integer idProveedor;

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer idProducto;

    private BigDecimal precioReferencial;
    
    private String codigoProductoProveedor;
    
    private Integer idEstado;
    
    // Nombres para mostrar en el listado
    private String nombreProducto;
    private String unidadMedida;
}
