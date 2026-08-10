package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoResumenDTO {
    private Integer idMovimiento;
    private Integer cantidad;
    private String observacion;
    private LocalDateTime fechaMovimiento;
    private Integer idEstadoAprobacion;
    private String nombreLote;
    private String tipoMovimiento;
    private String nombreUsuario;

    public static MovimientoResumenDTO from(MovimientoInventario movimiento) {
        if (movimiento == null) return null;

        return MovimientoResumenDTO.builder()
                .idMovimiento(movimiento.getIdMovimiento())
                .cantidad(movimiento.getCantidad())
                .observacion(movimiento.getObservacion())
                .fechaMovimiento(movimiento.getFechaMovimiento())
                .idEstadoAprobacion(movimiento.getIdEstadoAprobacion())
                .nombreLote(movimiento.getLote() != null ? movimiento.getLote().getNumeroLote() : null)
                .tipoMovimiento(movimiento.getTipoMovimiento() != null ? movimiento.getTipoMovimiento().getNombre() : null)
                .nombreUsuario(movimiento.getUsuario() != null ? movimiento.getUsuario().getNombres() + " " + movimiento.getUsuario().getApellidos() : null)
                .build();
    }
}
