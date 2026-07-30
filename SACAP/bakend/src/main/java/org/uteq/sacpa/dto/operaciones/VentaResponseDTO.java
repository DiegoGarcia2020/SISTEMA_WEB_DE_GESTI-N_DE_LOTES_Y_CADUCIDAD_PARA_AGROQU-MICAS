package org.uteq.sacpa.dto.operaciones;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VentaResponseDTO {
    private Integer id;
    private String cliente;
    private String tecnico;
    private LocalDateTime fecha;
    private String numeroComprobante;
    private String estado;
    private BigDecimal subtotal;
    private BigDecimal ivaAplicado;
    private BigDecimal costoEnvio;
    private BigDecimal total;
    private String metodoPago;
    private String referenciaPago;
    
    private List<DetalleVentaResponseDTO> detalles;

    @Data
    @Builder
    public static class DetalleVentaResponseDTO {
        private Integer idProducto;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
