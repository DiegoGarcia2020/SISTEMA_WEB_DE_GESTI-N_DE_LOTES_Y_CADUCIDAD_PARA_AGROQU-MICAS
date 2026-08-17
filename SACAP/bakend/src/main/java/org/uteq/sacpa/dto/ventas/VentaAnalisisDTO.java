package org.uteq.sacpa.dto.ventas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaAnalisisDTO {

    private String resumen;
    private List<String> hallazgos;
    private String tendencia;
    private boolean alertaAltaDemanda;
    private String alertaMensaje;
}
