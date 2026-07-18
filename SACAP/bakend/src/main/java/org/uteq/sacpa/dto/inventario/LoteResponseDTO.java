package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.Lote;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoteResponseDTO {
    private Integer       idLote;
    private String        numeroLote;
    private LocalDate     fechaFabricacion;
    private LocalDate     fechaVencimiento;
    private Integer       cantidadInicial;
    private Integer       cantidadActual;
    private LocalDateTime fechaIngreso;
    private Integer       idEstadoLote;

    // Datos desnormalizados para evitar lazy
    private Integer idProducto;
    private String  nombreProducto;
    private Integer idProveedor;
    private String  nombreProveedor;
    private Integer idUbicacion;
    private String  descripcionUbicacion;

    /** Días restantes hasta vencimiento (calculado) */
    private Long diasHastaVencimiento;

    public static LoteResponseDTO from(Lote l) {
        long dias = 0;
        if (l.getFechaVencimiento() != null) {
            dias = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), l.getFechaVencimiento());
        }

        String ubicacionDesc = null;
        if (l.getUbicacion() != null) {
            String est  = l.getUbicacion().getEstanteria() != null ? l.getUbicacion().getEstanteria().getCodigo() : "?";
            ubicacionDesc = est + " / N" + l.getUbicacion().getNivel() + " / P" + l.getUbicacion().getPosicion();
        }

        return LoteResponseDTO.builder()
                .idLote(l.getIdLote())
                .numeroLote(l.getNumeroLote())
                .fechaFabricacion(l.getFechaFabricacion())
                .fechaVencimiento(l.getFechaVencimiento())
                .cantidadInicial(l.getCantidadInicial())
                .cantidadActual(l.getCantidadActual())
                .fechaIngreso(l.getFechaIngreso())
                .idEstadoLote(l.getIdEstadoLote())
                .idProducto(l.getProducto()   != null ? l.getProducto().getIdProducto()     : null)
                .nombreProducto(l.getProducto() != null ? l.getProducto().getNombre()       : null)
                .idProveedor(l.getProveedor()  != null ? l.getProveedor().getIdProveedor()  : null)
                .nombreProveedor(l.getProveedor() != null ? l.getProveedor().getNombre() : null)
                .idUbicacion(l.getUbicacion()  != null ? l.getUbicacion().getIdUbicacion()  : null)
                .descripcionUbicacion(ubicacionDesc)
                .diasHastaVencimiento(dias)
                .build();
    }
}
