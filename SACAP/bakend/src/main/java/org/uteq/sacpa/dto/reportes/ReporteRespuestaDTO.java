package org.uteq.sacpa.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteRespuestaDTO {
    private String titulo;
    private List<Map<String, Object>> data;

    /** Total de registros que cumplen el filtro, sin paginar. */
    private Long total;

    /** Página devuelta, base 0. */
    private Integer pagina;

    /** Registros por página aplicados. */
    private Integer tamanio;

    public ReporteRespuestaDTO(String titulo, List<Map<String, Object>> data) {
        this.titulo = titulo;
        this.data = data;
        this.total = data != null ? (long) data.size() : 0L;
        this.pagina = 0;
        this.tamanio = data != null ? data.size() : 0;
    }
}
