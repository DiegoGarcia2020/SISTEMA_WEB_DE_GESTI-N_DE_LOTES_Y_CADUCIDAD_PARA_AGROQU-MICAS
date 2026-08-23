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
    /** Filtros adicionales dependiendo del reporte */
    private Integer idCategoria;
    private Integer idTemporada;
    private Integer idTipoMovimiento;
    private Integer idPromocion;

    /** Página solicitada, base 0. Por defecto la primera. */
    private Integer pagina;

    /** Registros por página. Por defecto 50; máximo permitido 500. */
    private Integer tamanio;
}
