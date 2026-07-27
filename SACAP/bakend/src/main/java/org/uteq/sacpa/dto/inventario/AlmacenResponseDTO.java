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
    private String  direccion;
    private BigDecimal capacidadTotal;
    private Integer idEstado;
    private String  ciudad;
    private Integer idCiudad;
    private Integer idSupervisor;
    private String  nombreSupervisor;

    public static AlmacenResponseDTO from(Almacen a) {
        return AlmacenResponseDTO.builder()
                .idAlmacen(a.getIdAlmacen())
                .nombre(a.getNombre())
                .direccion(a.getDireccion())
                .capacidadTotal(a.getCapacidadTotal())
                .idEstado(a.getIdEstado())
                .ciudad(a.getCiudad() != null ? a.getCiudad().getNombre() : null)
                .idCiudad(a.getCiudad() != null ? a.getCiudad().getIdCiudad() : null)
                .idSupervisor(a.getSupervisor() != null ? a.getSupervisor().getIdSupervisor() : null)
                .nombreSupervisor(a.getSupervisor() != null
                        ? (a.getSupervisor().getNombres() + " " + a.getSupervisor().getApellidos()) : null)
                .build();
    }
}
