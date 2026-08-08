package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevolucionVentaResponseDTO {
    private Integer id;
    private Integer idVenta;
    private String numeroComprobante;
    private String nombreCliente;
    private String nombreTecnico;
    private Integer idProducto;
    private String nombreProducto;
    private Integer cantidadDevuelta;
    private String motivo;
    private LocalDateTime fechaSolicitud;
    private String estadoLogistico;
    private String estadoInventario;
    private LocalDateTime fechaRecepcion;
}
