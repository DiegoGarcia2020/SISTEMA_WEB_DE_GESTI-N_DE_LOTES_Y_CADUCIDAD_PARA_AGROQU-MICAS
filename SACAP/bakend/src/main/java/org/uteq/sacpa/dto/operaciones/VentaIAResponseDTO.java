package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Cabecera de venta expuesta al frontend.
 * Tras la unificación se construye desde la entidad Venta (tabla operaciones.ventas).
 * Los nombres de campo (idVenta, numeroOrden, fechaVenta) se mantienen para no
 * romper el frontend, aunque en la tabla se llamen id / numero_comprobante / fecha.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VentaIAResponseDTO {
    private Integer idVenta;
    private String numeroOrden;
    private LocalDateTime fechaVenta;
    private Integer idCliente;
    private String nombreCliente;
    private String nombreTecnico;
    private BigDecimal subtotal;
    private BigDecimal descuentoTotal;
    private BigDecimal ivaAplicado;
    private BigDecimal total;
    private String estado;
    private List<DetalleVentaResponseDTO> lineas;

    /**
     * @param nombreTecnico resuelto externamente desde TecnicoCampo (Usuario tiene @Transient en nombres/apellidos)
     */
    public static VentaIAResponseDTO from(Venta v, List<DetalleVentaResponseDTO> lineas, String nombreTecnico) {
        return VentaIAResponseDTO.builder()
                .idVenta(v.getId())
                .numeroOrden(v.getNumeroComprobante())
                .fechaVenta(v.getFecha())
                .idCliente(v.getCliente() != null ? v.getCliente().getIdCliente() : null)
                .nombreCliente(v.getCliente() != null ? v.getCliente().getNombreFinca() : null)
                .nombreTecnico(nombreTecnico)
                .subtotal(v.getSubtotal())
                .descuentoTotal(v.getDescuentoTotal())
                .ivaAplicado(v.getIvaAplicado())
                .total(v.getTotal())
                .estado(v.getEstado())
                .lineas(lineas)
                .build();
    }
}
