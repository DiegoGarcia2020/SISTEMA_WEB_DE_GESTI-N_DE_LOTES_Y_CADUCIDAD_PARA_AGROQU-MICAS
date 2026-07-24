package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO de entrada para la recepción física de una Orden de Compra.
 * El Bodeguero envía este DTO cuando confirma que los productos llegaron
 * y les asigna número de lote y fecha de caducidad.
 *
 * Cada detalle de la orden genera un lote en estado FLOTANTE.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionLoteRequestDTO {

    @NotNull(message = "El ID de la orden de compra es obligatorio")
    private Integer idOrdenCompra;

    @NotEmpty(message = "Debe enviar al menos un lote para la recepción")
    @Valid
    private List<LoteRecepcionItemDTO> lotes;

    /**
     * DTO anidado para cada lote a crear en la recepción.
     * El número de lote y la fecha de caducidad vienen impresos en la caja física.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoteRecepcionItemDTO {

        @NotNull(message = "El ID del detalle de compra es obligatorio")
        private Integer idDetalleCompra;

        @NotNull(message = "El número de lote es obligatorio")
        private String numeroLote;

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        private LocalDate fechaVencimiento;

        /** Fecha de fabricación (opcional, viene impresa en la caja) */
        private LocalDate fechaFabricacion;
    }
}
