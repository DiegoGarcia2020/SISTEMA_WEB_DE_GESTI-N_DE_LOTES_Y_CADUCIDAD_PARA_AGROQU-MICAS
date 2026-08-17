package org.uteq.sacpa.service.operaciones;

import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ventas.VentaAnalisisDTO;
import org.uteq.sacpa.dto.ventas.VentaRankingDTO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Análisis "IA" de ventas (reglas deterministas sobre el ranking).
 * Genera resumen, hallazgos y alertas de alta demanda para el Dashboard IA.
 */
@Service
public class VentaAnalisisIAService {

    private static final BigDecimal UMBRAL_VARIACION = BigDecimal.valueOf(30);
    private static final long UMBRAL_UNIDADES = 20;

    public VentaAnalisisDTO analizar(List<VentaRankingDTO> ranking, List<VentaRankingDTO> rankingAnterior) {
        List<String> hallazgos = new ArrayList<>();
        boolean alerta = false;
        String alertaMensaje = null;
        String tendencia = "ESTABLE";

        if (ranking == null || ranking.isEmpty()) {
            return VentaAnalisisDTO.builder()
                    .resumen("Aún no hay ventas registradas en el período seleccionado.")
                    .hallazgos(hallazgos)
                    .tendencia(tendencia)
                    .alertaAltaDemanda(false)
                    .alertaMensaje(null)
                    .build();
        }

        long totalUnidades = ranking.stream().mapToLong(VentaRankingDTO::getUnidades).sum();
        VentaRankingDTO lider = ranking.get(0);

        BigDecimal pctLider = totalUnidades == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(lider.getUnidades() * 100.0 / totalUnidades).setScale(1, RoundingMode.HALF_UP);

        String resumen = String.format(
                "El producto líder es %s con %d unidades vendidas, representando el %s%% del total del período.",
                lider.getNombre(), lider.getUnidades(), pctLider.toPlainString());

        int limite = Math.min(ranking.size(), 3);
        for (int i = 0; i < limite; i++) {
            VentaRankingDTO r = ranking.get(i);
            BigDecimal pct = totalUnidades == 0
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(r.getUnidades() * 100.0 / totalUnidades).setScale(1, RoundingMode.HALF_UP);
            hallazgos.add(String.format("%s: %d unidades (%s%% del total).",
                    r.getNombre(), r.getUnidades(), pct.toPlainString()));
        }

        long totalAnterior = rankingAnterior == null
                ? 0 : rankingAnterior.stream().mapToLong(VentaRankingDTO::getUnidades).sum();

        if (totalAnterior > 0) {
            BigDecimal variacionTotal = BigDecimal.valueOf((totalUnidades - totalAnterior) * 100.0 / totalAnterior)
                    .setScale(1, RoundingMode.HALF_UP);
            tendencia = variacionTotal.compareTo(BigDecimal.ZERO) >= 0 ? "AL ALZA" : "A LA BAJA";
            hallazgos.add(String.format("El volumen total %s un %s%% frente al período anterior.",
                    tendencia.equals("AL ALZA") ? "aumentó" : "disminuyó", variacionTotal.toPlainString()));
        }

        if (lider.getVariacion() != null && lider.getVariacion() >= UMBRAL_VARIACION.doubleValue()
                && lider.getUnidades() >= UMBRAL_UNIDADES) {
            alerta = true;
            alertaMensaje = String.format(
                    "Alta demanda detectada: %s creció un %.1f%% vs el período anterior con %d unidades vendidas. "
                            + "Se recomienda verificar stock disponible y planificar reabastecimiento.",
                    lider.getNombre(), lider.getVariacion(), lider.getUnidades());
        }

        return VentaAnalisisDTO.builder()
                .resumen(resumen)
                .hallazgos(hallazgos)
                .tendencia(tendencia)
                .alertaAltaDemanda(alerta)
                .alertaMensaje(alertaMensaje)
                .build();
    }
}
