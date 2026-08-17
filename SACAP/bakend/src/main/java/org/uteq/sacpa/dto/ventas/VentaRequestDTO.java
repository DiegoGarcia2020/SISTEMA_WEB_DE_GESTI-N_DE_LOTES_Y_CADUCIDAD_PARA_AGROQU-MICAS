package org.uteq.sacpa.dto.ventas;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaRequestDTO {

    @NotNull(message = "El ID del usuario es obligatorio")
    private Integer idUsuario;

    private LocalDateTime fechaVenta;

    private String cliente;

    @Valid
    @NotEmpty(message = "La venta debe tener al menos un detalle")
    private List<DetalleVentaRequestDTO> detalles;
}
