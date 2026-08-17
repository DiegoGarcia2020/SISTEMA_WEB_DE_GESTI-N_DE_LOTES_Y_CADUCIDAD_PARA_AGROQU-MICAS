package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.UbicacionInterna;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UbicacionInternaResponseDTO {
    private Integer idUbicacion;
    private String  nivel;
    private String  posicion;
    /** Descripción completa legible: Estantería-Nivel-Posición */
    private String  descripcionCompleta;
    private Integer idEstanteria;
    private String  codigoEstanteria;
    private Integer capacidadMaxima;
    private Integer capacidadActual;
    private Integer capacidadDisponible;
    private Integer porcentajeOcupacion;
    private String  codigoQr;

    public static UbicacionInternaResponseDTO from(UbicacionInterna u) {
        return from(u, u.getCapacidadActual() != null ? u.getCapacidadActual() : 0);
    }

    /** @param capacidadActualReal ocupación real calculada en vivo desde los lotes (ver AlmacenServiceImpl.obtenerOcupacionRealPorUbicacion) */
    public static UbicacionInternaResponseDTO from(UbicacionInterna u, int capacidadActualReal) {
        String codigoEst = u.getEstanteria() != null ? u.getEstanteria().getCodigo() : "?";
        int capMax = u.getCapacidadMaxima() != null ? u.getCapacidadMaxima() : 100;
        int capAct = capacidadActualReal;
        int capDisp = Math.max(0, capMax - capAct);
        int pctOcup = capMax > 0 ? (int) Math.round(((double) capAct / capMax) * 100.0) : 0;
        String qr = u.getCodigoQr() != null ? u.getCodigoQr() : ("UBIC-EST" + (u.getEstanteria() != null ? u.getEstanteria().getIdEstanteria() : "0") + "-N" + u.getNivel() + "-P" + u.getPosicion());

        return UbicacionInternaResponseDTO.builder()
                .idUbicacion(u.getIdUbicacion())
                .nivel(u.getNivel())
                .posicion(u.getPosicion())
                .descripcionCompleta(codigoEst + " / Nivel " + u.getNivel() + " / Pos. " + u.getPosicion())
                .idEstanteria(u.getEstanteria() != null ? u.getEstanteria().getIdEstanteria() : null)
                .codigoEstanteria(codigoEst)
                .capacidadMaxima(capMax)
                .capacidadActual(capAct)
                .capacidadDisponible(capDisp)
                .porcentajeOcupacion(pctOcup)
                .codigoQr(qr)
                .build();
    }
}
