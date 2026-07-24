package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO de entrada para crear una Orden de Compra.
 * Recibe el JSON desde Angular con la cabecera y la lista de detalles (productos).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenCompraRequestDTO {

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Integer idProveedor;

    @NotBlank(message = "El número de factura es obligatorio")
    private String numeroFactura;

    @NotNull(message = "La fecha de emisión es obligatoria")
    private LocalDate fechaEmision;

    /** Costo del flete/envío. Si no aplica, enviar 0 */
    private BigDecimal costoTransporte;

    /** Impuestos aplicados a la factura */
    private BigDecimal impuestos;

    @NotEmpty(message = "La orden debe tener al menos un detalle")
    @Valid
    private List<DetalleCompraRequestDTO> detalles;
}
