package org.uteq.sacpa.dto.ia_modelos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.ia_alertas.Promocion;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;
import org.uteq.sacpa.entity.inventario.Lote;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PromocionResponseDTO {
    private Integer idPromocion;
    private String titulo;
    private String codigoLote;
    private String nombreProducto;
    private BigDecimal descuentoSugerido;
    private BigDecimal precioOriginal;
    private BigDecimal precioPromocion;
    private String justificacionIA;
    private String estado;
    private LocalDate fechaCreacion;
    private LocalDate fechaVigencia;

    public static PromocionResponseDTO from(Promocion p) {
        SugerenciaIA sug = p.getSugerencia();
        Lote lote = sug != null ? sug.getLote() : null;

        BigDecimal precioOriginal = (lote != null && lote.getProducto() != null) ? lote.getProducto().getPrecio() : null;
        BigDecimal precioPromocion = null;
        if (precioOriginal != null && p.getDescuentoGlobal() != null) {
            BigDecimal factor = BigDecimal.ONE.subtract(p.getDescuentoGlobal().divide(new BigDecimal("100")));
            precioPromocion = precioOriginal.multiply(factor).setScale(2, RoundingMode.HALF_UP);
        }

        return PromocionResponseDTO.builder()
                .idPromocion(p.getIdPromocion())
                .titulo(p.getNombrePromocion())
                .codigoLote(lote != null ? lote.getNumeroLote() : null)
                .nombreProducto(lote != null && lote.getProducto() != null ? lote.getProducto().getNombre() : null)
                .descuentoSugerido(p.getDescuentoGlobal())
                .precioOriginal(precioOriginal)
                .precioPromocion(precioPromocion)
                .justificacionIA(sug != null ? sug.getObservaciones() : p.getDescripcion())
                .estado(p.getEstado() != null ? p.getEstado().getNombre() : null)
                .fechaCreacion(p.getFechaInicio())
                .fechaVigencia(p.getFechaFin())
                .build();
    }
}
