package org.uteq.sacpa.dto.ia_alertas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.ia_alertas.AlertaCaducidad;
import org.uteq.sacpa.entity.inventario.Lote;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AlertaCaducidadResponseDTO {
    private Integer idAlerta;
    private String codigoLote;
    private String nombreProducto;
    private String bodega;
    private Integer stockActual;
    private String unidadMedida;
    private LocalDate fechaCaducidad;
    private Long diasRestantes;
    private String nivelPrioridad;
    private String estado;
    private BigDecimal sugerenciaDescuento;

    public static AlertaCaducidadResponseDTO from(AlertaCaducidad a, BigDecimal sugerenciaDescuento) {
        Lote lote = a.getLote();
        String bodega = "N/D";
        if (lote != null && lote.getUbicacion() != null && lote.getUbicacion().getEstanteria() != null
                && lote.getUbicacion().getEstanteria().getZona() != null
                && lote.getUbicacion().getEstanteria().getZona().getAlmacen() != null) {
            bodega = lote.getUbicacion().getEstanteria().getZona().getAlmacen().getNombre();
        }
        Long dias = (lote != null && lote.getFechaVencimiento() != null)
                ? ChronoUnit.DAYS.between(LocalDate.now(), lote.getFechaVencimiento()) : null;

        return AlertaCaducidadResponseDTO.builder()
                .idAlerta(a.getIdAlerta())
                .codigoLote(lote != null ? lote.getNumeroLote() : null)
                .nombreProducto(lote != null && lote.getProducto() != null ? lote.getProducto().getNombre() : null)
                .bodega(bodega)
                .stockActual(lote != null ? lote.getCantidadActual() : null)
                .unidadMedida(lote != null && lote.getProducto() != null ? lote.getProducto().getUnidadMedida() : null)
                .fechaCaducidad(lote != null ? lote.getFechaVencimiento() : null)
                .diasRestantes(dias)
                .nivelPrioridad(mapearNivelPrioridad(a.getNivelAlerta() != null ? a.getNivelAlerta().getNombre() : null))
                .estado(a.getEstado() != null ? a.getEstado().getNombre() : null)
                .sugerenciaDescuento(sugerenciaDescuento)
                .build();
    }

    /**
     * El catálogo catalogos.cat_nivel_alerta usa INFORMATIVA/PREVENTIVA/ADVERTENCIA/CRÍTICA,
     * pero el frontend (filtros y badges de prioridad) espera MEDIA/ALTA/URGENTE.
     */
    private static String mapearNivelPrioridad(String nombreCatalogo) {
        if (nombreCatalogo == null) return null;
        return switch (nombreCatalogo.toUpperCase()) {
            case "CRÍTICA", "CRITICA" -> "URGENTE";
            case "ADVERTENCIA" -> "ALTA";
            default -> "MEDIA"; // PREVENTIVA / INFORMATIVA
        };
    }
}
