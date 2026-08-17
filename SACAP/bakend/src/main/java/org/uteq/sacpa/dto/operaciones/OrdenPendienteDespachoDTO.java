package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.Venta;

/** Vista plana de una Venta pendiente de preparación física por Bodega (evita lazy fuera de sesión). */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrdenPendienteDespachoDTO {
    private Integer id;
    private String numeroComprobante;
    private String tecnico;
    private String fechaEstimadaEntrega;
    private String ventanaHoraria;
    private String estado;

    public static OrdenPendienteDespachoDTO from(Venta v) {
        return OrdenPendienteDespachoDTO.builder()
                .id(v.getId())
                .numeroComprobante(v.getNumeroComprobante())
                .tecnico(v.getTecnico() != null ? v.getTecnico().getCorreo() : "N/A")
                .fechaEstimadaEntrega(v.getFechaEstimadaEntrega() != null ? v.getFechaEstimadaEntrega().toString() : "Sin definir")
                .ventanaHoraria(v.getVentanaHoraria() != null ? v.getVentanaHoraria() : "Sin definir")
                .estado(v.getEstado())
                .build();
    }
}
