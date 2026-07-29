package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VentaResponseDTO {
    private Integer idVenta;
    private String numeroOrden;
    private LocalDateTime fechaVenta;
    private Integer idCliente;
    private String nombreCliente;
    private String nombreTecnico;
    private BigDecimal subtotal;
    private BigDecimal descuentoTotal;
    private BigDecimal total;
    private String estado;
    private List<DetalleVentaResponseDTO> lineas;

    public static VentaResponseDTO from(Venta v, List<DetalleVentaResponseDTO> lineas) {
        return VentaResponseDTO.builder()
                .idVenta(v.getIdVenta())
                .numeroOrden(v.getNumeroOrden())
                .fechaVenta(v.getFechaVenta())
                .idCliente(v.getCliente() != null ? v.getCliente().getIdCliente() : null)
                .nombreCliente(v.getCliente() != null ? v.getCliente().getNombre() : null)
                .nombreTecnico(v.getTecnico() != null ? (v.getTecnico().getNombres() + " " + v.getTecnico().getApellidos()) : null)
                .subtotal(v.getSubtotal())
                .descuentoTotal(v.getDescuentoTotal())
                .total(v.getTotal())
                .estado(v.getEstado() != null ? v.getEstado().getNombre() : null)
                .lineas(lineas)
                .build();
    }
}
