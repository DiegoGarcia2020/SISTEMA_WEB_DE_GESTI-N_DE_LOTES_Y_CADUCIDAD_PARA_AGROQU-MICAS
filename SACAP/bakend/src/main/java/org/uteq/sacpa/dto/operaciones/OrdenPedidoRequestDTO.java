package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para que el Técnico-Comercial cree una Orden de Pedido.
 * Se guarda en operaciones.uso_campo con tipo_registro = 'ORDEN_PEDIDO'.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenPedidoRequestDTO {

    @NotNull(message = "El ID del cliente es obligatorio")
    private Integer idCliente;

    @NotBlank(message = "La descripción de la plaga o problema es obligatoria")
    private String descripcionPlaga;

    @NotNull(message = "El ID del lote es obligatorio")
    private Integer idLote;

    @NotNull(message = "La cantidad solicitada es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    private String observacion;

    @NotNull(message = "El ID del técnico es obligatorio")
    private Integer idTecnico;

    /** Opcional: ID del combo IA que el técnico aplicó */
    private Integer idComboAplicado;
}
