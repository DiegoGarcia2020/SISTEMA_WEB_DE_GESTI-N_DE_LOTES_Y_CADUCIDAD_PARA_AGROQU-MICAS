package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.ZonaAlmacen;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ZonaAlmacenResponseDTO {
    private Integer idZona;
    private String  nombre;
    private String  condicionClimatica;
    private Integer idEstado;
    private Integer idAlmacen;

    public static ZonaAlmacenResponseDTO from(ZonaAlmacen z) {
        return ZonaAlmacenResponseDTO.builder()
                .idZona(z.getIdZona())
                .nombre(z.getNombre())
                .condicionClimatica(z.getCondicionClimatica())
                .idEstado(z.getIdEstado())
                .idAlmacen(z.getAlmacen() != null ? z.getAlmacen().getIdAlmacen() : null)
                .build();
    }
}
