package org.uteq.sacpa.dto.inventario;

import lombok.Builder;
import lombok.Data;
import org.uteq.sacpa.entity.inventario.Lote;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Data
@Builder
public class UbicacionProductoDTO {
    private Integer idLote;
    private String numeroLote;
    private LocalDate fechaVencimiento;
    private Integer cantidadActual;
    private Integer cantidadReservada;
    private Integer cantidadDisponible;
    
    private String nombreAlmacen;
    private String nombreZona;
    private String codigoEstanteria;
    private String codigoUbicacion;
    
    private String estadoLote;
    private Long diasParaVencer;

    public static UbicacionProductoDTO fromEntity(Lote lote) {
        int cantActual = lote.getCantidadActual() != null ? lote.getCantidadActual() : 0;
        int cantReservada = lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0;
        int cantDisponible = cantActual - cantReservada;

        String almacen = "Sin ubicar";
        String zona = "Sin ubicar";
        String estanteria = "Sin ubicar";
        String ubicacion = "Sin ubicar";

        if (lote.getUbicacion() != null) {
            ubicacion = lote.getUbicacion().getNivel() + "-" + lote.getUbicacion().getPosicion();
            if (lote.getUbicacion().getEstanteria() != null) {
                estanteria = lote.getUbicacion().getEstanteria().getCodigo();
                if (lote.getUbicacion().getEstanteria().getZona() != null) {
                    zona = lote.getUbicacion().getEstanteria().getZona().getNombre();
                    if (lote.getUbicacion().getEstanteria().getZona().getAlmacen() != null) {
                        almacen = lote.getUbicacion().getEstanteria().getZona().getAlmacen().getNombre();
                    }
                }
            }
        } else if (lote.getAlmacen() != null) {
            almacen = lote.getAlmacen().getNombre();
        }

        String estadoTexto = "Desconocido";
        if (lote.getIdEstadoLote() != null) {
            estadoTexto = lote.getIdEstadoLote() == 1 ? "Activo" : 
                          lote.getIdEstadoLote() == 2 ? "Inactivo" : 
                          lote.getIdEstadoLote() == 3 ? "Cuarentena" : "Pendiente";
        }

        long diasParaVencer = 0;
        if (lote.getFechaVencimiento() != null) {
            diasParaVencer = ChronoUnit.DAYS.between(LocalDate.now(), lote.getFechaVencimiento());
        }

        return UbicacionProductoDTO.builder()
                .idLote(lote.getIdLote())
                .numeroLote(lote.getNumeroLote())
                .fechaVencimiento(lote.getFechaVencimiento())
                .cantidadActual(cantActual)
                .cantidadReservada(cantReservada)
                .cantidadDisponible(cantDisponible)
                .nombreAlmacen(almacen)
                .nombreZona(zona)
                .codigoEstanteria(estanteria)
                .codigoUbicacion(ubicacion)
                .estadoLote(estadoTexto)
                .diasParaVencer(diasParaVencer)
                .build();
    }
}
