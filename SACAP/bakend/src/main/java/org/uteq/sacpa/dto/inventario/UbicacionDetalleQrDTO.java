package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UbicacionDetalleQrDTO {
    private Integer idUbicacion;
    private String codigoQr;
    private String descripcionCompleta;
    private String nombreAlmacen;
    private String nombreZona;
    private String codigoEstanteria;
    private String nivel;
    private String posicion;
    private Integer capacidadMaxima;
    private Integer capacidadActual;
    private Integer capacidadDisponible;
    private Integer porcentajeOcupacion;

    private List<LoteResponseDTO> lotesAlmacenados;
}
