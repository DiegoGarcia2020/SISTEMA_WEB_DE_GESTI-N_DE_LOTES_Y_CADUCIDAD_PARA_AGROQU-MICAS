package org.uteq.sacpa.dto.analisis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoteProximoVencerDTO {
    private Integer idLote;
    private String numeroLote;
    private String nombreProducto;
    private Integer cantidadActual;
    private LocalDate fechaVencimiento;
    private Long diasRestantes;
    private String nivelAlerta;
    private String estadoLote;
}
