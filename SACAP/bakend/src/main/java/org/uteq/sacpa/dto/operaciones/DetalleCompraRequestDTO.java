package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para cada línea/producto dentro de la Orden de Compra.
 * Puede ser un ítem pagado normal o una bonificación (regalo del proveedor).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleCompraRequestDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Integer idProducto;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    @NotNull(message = "El precio unitario es obligatorio")
    private BigDecimal precioUnitario;

    /** Porcentaje de descuento. Ej: 10.00 para 10%. Default 0 */
    private BigDecimal porcentajeDescuento;

    /**
     * TRUE = Producto de regalo (bonificación).
     * El backend forzará precio_unitario = 0 y lo incluirá
     * en el cálculo del costo promedio real.
     */
    private Boolean esBonificacion;
}
