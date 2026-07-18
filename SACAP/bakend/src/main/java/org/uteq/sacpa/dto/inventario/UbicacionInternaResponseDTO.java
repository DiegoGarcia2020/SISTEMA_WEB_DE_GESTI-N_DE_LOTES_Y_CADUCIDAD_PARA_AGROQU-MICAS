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

    public static UbicacionInternaResponseDTO from(UbicacionInterna u) {
        String codigoEst = u.getEstanteria() != null ? u.getEstanteria().getCodigo() : "?";
        return UbicacionInternaResponseDTO.builder()
                .idUbicacion(u.getIdUbicacion())
                .nivel(u.getNivel())
                .posicion(u.getPosicion())
                .descripcionCompleta(codigoEst + " / Nivel " + u.getNivel() + " / Pos. " + u.getPosicion())
                .idEstanteria(u.getEstanteria() != null ? u.getEstanteria().getIdEstanteria() : null)
                .codigoEstanteria(codigoEst)
                .build();
    }
}
