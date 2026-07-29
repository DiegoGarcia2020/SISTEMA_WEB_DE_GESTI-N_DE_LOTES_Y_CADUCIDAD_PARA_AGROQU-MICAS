package org.uteq.sacpa.dto.ia_alertas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Un lote candidato dentro de una sugerencia del Motor IA, con el score que lo justifica. */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoteSugeridoDTO {
    private Integer idLote;
    private String numeroLote;
    private Integer idProducto;
    private String nombreProducto;
    private String nombreBodega;
    private Long diasHastaVencimiento;
    private Integer cantidadDisponible;
    private BigDecimal precioUnitario;
    private Integer scoreUrgencia;
    private String instruccionesAplicacion;
}
