package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoteDisponibleDTO {
    private Integer idLote;
    private String numeroLote;
    private Integer idProducto;
    private String nombreProducto;
    private Integer cantidadActual;
    private LocalDate fechaVencimiento;
    private String nombreProveedor;
    private String ubicacionAlmacen;
}
