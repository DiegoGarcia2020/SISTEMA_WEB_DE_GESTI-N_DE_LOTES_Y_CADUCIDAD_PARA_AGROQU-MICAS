package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de respuesta para consultar una Orden de Compra completa.
 * Incluye datos del proveedor y la lista de detalles con nombres de producto expandidos.
 * Se usa para el listado y la pantalla de recepción en el frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenCompraResponseDTO {

    private Integer id;
    private Integer idProveedor;
    private String nombreProveedor;
    private String numeroFactura;
    private LocalDate fechaEmision;
    private BigDecimal subtotalBruto;
    private BigDecimal totalDescuentos;
    private BigDecimal costoTransporte;
    private BigDecimal impuestos;
    private BigDecimal totalNeto;
    private String estado;
    private LocalDateTime fechaRegistro;

    private List<DetalleCompraResponseDTO> detalles;

    /**
     * DTO anidado para cada línea del detalle.
     * Incluye el nombre del producto expandido para evitar N+1 queries en el frontend.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleCompraResponseDTO {
        private Integer id;
        private Integer idProducto;
        private String nombreProducto;
        private String unidadMedida;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal porcentajeDescuento;
        private BigDecimal valorDescuento;
        private BigDecimal subtotal;
        private Boolean esBonificacion;
    }
}
