package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.Almacen;

import java.math.BigDecimal;

/**
 * DTO para mostrar al Supervisor las bodegas que tiene asignadas.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MiBodegaDTO {
    private Integer idAlmacen;
    private String nombre;
    private String direccion;
    private String ciudad;
    private BigDecimal capacidadTotal;
    private Integer idEstado;

    public static MiBodegaDTO from(Almacen a) {
        return MiBodegaDTO.builder()
                .idAlmacen(a.getIdAlmacen())
                .nombre(a.getNombre())
                .direccion(a.getDireccion())
                .ciudad(a.getCiudad() != null ? a.getCiudad().getNombre() : null)
                .capacidadTotal(a.getCapacidadTotal())
                .idEstado(a.getIdEstado())
                .build();
    }
}
