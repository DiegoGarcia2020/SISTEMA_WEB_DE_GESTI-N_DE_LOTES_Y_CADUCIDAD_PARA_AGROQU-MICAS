package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.Estanteria;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EstanteriaResponseDTO {
    private Integer idEstanteria;
    private String  codigo;
    private Integer idEstado;
    private Integer idZona;

    public static EstanteriaResponseDTO from(Estanteria e) {
        return EstanteriaResponseDTO.builder()
                .idEstanteria(e.getIdEstanteria())
                .codigo(e.getCodigo())
                .idEstado(e.getIdEstado())
                .idZona(e.getZona() != null ? e.getZona().getIdZona() : null)
                .build();
    }
}
