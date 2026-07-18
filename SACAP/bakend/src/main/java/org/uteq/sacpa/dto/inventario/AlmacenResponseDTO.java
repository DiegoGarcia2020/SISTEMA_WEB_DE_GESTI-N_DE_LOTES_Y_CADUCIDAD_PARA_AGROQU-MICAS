package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.Almacen;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AlmacenResponseDTO {
    private Integer idAlmacen;
    private String  nombre;
    private BigDecimal capacidadTotal;
    private Integer idEstado;
    private String  ciudad;

    public static AlmacenResponseDTO from(Almacen a) {
        return AlmacenResponseDTO.builder()
                .idAlmacen(a.getIdAlmacen())
                .nombre(a.getNombre())
                .capacidadTotal(a.getCapacidadTotal())
                .idEstado(a.getIdEstado())
                .ciudad(a.getCiudad() != null ? a.getCiudad().getNombre() : null)
                .build();
    }
}
