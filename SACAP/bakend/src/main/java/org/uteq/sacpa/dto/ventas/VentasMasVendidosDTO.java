package org.uteq.sacpa.dto.ventas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentasMasVendidosDTO {

    private String periodo;
    private LocalDateTime desde;
    private LocalDateTime hasta;
    private Integer top;
    private List<VentaRankingDTO> ranking;
    private List<VentaRankingDTO> rankingAnterior;
    private VentaAnalisisDTO analisis;
    private Long totalVentas;
    private Long totalUnidades;
    private BigDecimal totalMonto;
}
