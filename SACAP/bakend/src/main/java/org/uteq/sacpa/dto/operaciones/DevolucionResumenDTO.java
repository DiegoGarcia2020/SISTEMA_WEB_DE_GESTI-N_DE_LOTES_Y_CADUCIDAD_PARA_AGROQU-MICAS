package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.Devolucion;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevolucionResumenDTO {
    private Integer idDevolucion;
    private String motivo;
    private Integer cantidad;
    private LocalDateTime fechaDevolucion;
    private Integer idEstadoAprobacion;
    private String nombreLote;
    private String nombreProveedor;
    private String nombreSupervisor;

    public static DevolucionResumenDTO from(Devolucion devolucion) {
        if (devolucion == null) return null;
        
        return DevolucionResumenDTO.builder()
                .idDevolucion(devolucion.getIdDevolucion())
                .motivo(devolucion.getMotivo())
                .cantidad(devolucion.getCantidad())
                .fechaDevolucion(devolucion.getFechaDevolucion())
                .idEstadoAprobacion(devolucion.getIdEstadoAprobacion())
                .nombreLote(devolucion.getLote() != null ? devolucion.getLote().getNumeroLote() : null)
                .nombreProveedor(devolucion.getProveedor() != null && devolucion.getProveedor().getEmpresa() != null ? devolucion.getProveedor().getEmpresa().getNombre() : null)
                .nombreSupervisor(devolucion.getSupervisor() != null ? devolucion.getSupervisor().getNombres() + " " + devolucion.getSupervisor().getApellidos() : null)
                .build();
    }
}
