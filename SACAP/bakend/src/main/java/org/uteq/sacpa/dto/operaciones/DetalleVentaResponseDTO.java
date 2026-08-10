package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.DetalleVenta;

import java.math.BigDecimal;

/**
 * Línea de venta expuesta al frontend.
 * Los nombres de campo se mantienen estables (idLote, subtotalLinea, esComboIA)
 * aunque la entidad de origen ahora sea la tabla unificada DetalleVenta.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DetalleVentaResponseDTO {
    private Integer idDetalle;
    private Integer idLote;
    private String numeroLote;
    private Integer idProducto;
    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotalLinea;
    private Boolean esComboIA;
    private Integer idPromocion;
    private String instruccionesAplicacion;

    public static DetalleVentaResponseDTO from(DetalleVenta d) {
        // El producto se toma del lote cuando existe (venta trazada por lote);
        // si no, del campo directo, para las líneas antiguas del POS.
        var producto = d.getLote() != null ? d.getLote().getProducto() : d.getProducto();
        return DetalleVentaResponseDTO.builder()
                .idDetalle(d.getId())
                .idLote(d.getLote() != null ? d.getLote().getIdLote() : null)
                .numeroLote(d.getLote() != null ? d.getLote().getNumeroLote() : null)
                .idProducto(producto != null ? producto.getIdProducto() : null)
                .nombreProducto(producto != null ? producto.getNombre() : null)
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .subtotalLinea(d.getSubtotal())
                .esComboIA(d.getEsSugerenciaIa())
                .idPromocion(d.getPromocion() != null ? d.getPromocion().getIdPromocion() : null)
                .instruccionesAplicacion(producto != null ? producto.getInstruccionesAplicacion() : null)
                .build();
    }
}
