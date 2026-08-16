package org.uteq.sacpa.dto.reportes;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class ReporteFiltrosDTO {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaInicio;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaFin;
    
    private Integer idProducto;
    private Integer idCliente;
    private Integer idCategoria;
    private Integer idTemporada;
}
