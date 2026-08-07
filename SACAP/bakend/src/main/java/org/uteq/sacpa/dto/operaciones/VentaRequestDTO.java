package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaRequestDTO {

    @NotNull(message = "El ID del cliente es obligatorio")
    private Integer idCliente;

    @NotNull(message = "El ID del técnico es obligatorio")
    private Integer idTecnico;

    @NotEmpty(message = "La venta debe tener al menos un detalle")
    @Valid
    private List<DetalleVentaRequestDTO> detalles;

    // Logística y Pago (Smart POS)
    private java.math.BigDecimal costoEnvio;
    private String metodoPago;
    private String referenciaPago;
    private java.time.LocalDate fechaEstimadaEntrega;
    private String ventanaHoraria;
}
