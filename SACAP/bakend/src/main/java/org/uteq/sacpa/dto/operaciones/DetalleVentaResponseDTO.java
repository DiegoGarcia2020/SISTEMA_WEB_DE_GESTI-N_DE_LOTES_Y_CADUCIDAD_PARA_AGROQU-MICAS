package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.DetalleVentaIA;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DetalleVentaResponseDTO {
    private Integer idDetalle;
    private Integer idLote;
    private String numeroLote;
    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotalLinea;
    private Boolean esComboIA;
    private String instruccionesAplicacion;

    public static DetalleVentaResponseDTO from(DetalleVentaIA d) {
        var producto = d.getLote() != null ? d.getLote().getProducto() : null;
        return DetalleVentaResponseDTO.builder()
                .idDetalle(d.getIdDetalle())
                .idLote(d.getLote() != null ? d.getLote().getIdLote() : null)
                .numeroLote(d.getLote() != null ? d.getLote().getNumeroLote() : null)
                .nombreProducto(producto != null ? producto.getNombre() : null)
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .subtotalLinea(d.getSubtotalLinea())
                .esComboIA(d.getEsComboIA())
                .instruccionesAplicacion(producto != null ? producto.getInstruccionesAplicacion() : null)
                .build();
    }
}
