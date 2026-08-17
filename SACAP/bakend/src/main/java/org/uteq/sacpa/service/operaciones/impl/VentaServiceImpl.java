package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ventas.*;
import org.uteq.sacpa.repository.operaciones.IVentaRepository;
import org.uteq.sacpa.service.operaciones.IVentaService;
import org.uteq.sacpa.service.operaciones.VentaAnalisisIAService;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VentaServiceImpl implements IVentaService {

    @Autowired
    private IVentaRepository ventaRepository;

    @Autowired
    private VentaAnalisisIAService analisisIAService;

    @Override
    @Transactional(readOnly = true)
    public VentasMasVendidosDTO masVendidos(String periodo, Integer top) {
        return masVendidos(periodo, top, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public VentasMasVendidosDTO masVendidos(String periodo, Integer top, LocalDateTime desdeParam, LocalDateTime hastaParam) {
        Ventana v = ventana(periodo, desdeParam, hastaParam);
        boolean sinLimite = top == null || top <= 0;
        int topReal = sinLimite ? Integer.MAX_VALUE : Math.max(1, Math.min(top, 10));

        List<VentaRankingDTO> ranking = mapearRanking(ventaRepository.rankingPorPeriodo(v.desde(), v.hasta()));
        List<VentaRankingDTO> rankingAnterior = mapearRanking(ventaRepository.rankingPorPeriodo(v.desdeAnterior(), v.hastaAnterior()));

        calcularVariaciones(ranking, rankingAnterior);

        Long totalVentas = ventaRepository.contarVentasPeriodo(v.desde(), v.hasta());
        long totalUnidades = ranking.stream().mapToLong(VentaRankingDTO::getUnidades).sum();
        BigDecimal totalMonto = ranking.stream()
                .map(r -> r.getMontoTotal() == null ? BigDecimal.ZERO : r.getMontoTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        VentaAnalisisDTO analisis = analisisIAService.analizar(ranking, rankingAnterior);

        return VentasMasVendidosDTO.builder()
                .periodo(periodo == null ? "ESTA_SEMANA" : periodo.toUpperCase())
                .desde(v.desde())
                .hasta(v.hasta())
                .top(sinLimite ? null : topReal)
                .ranking(sinLimite ? ranking : ranking.stream().limit(topReal).toList())
                .rankingAnterior(sinLimite ? rankingAnterior : rankingAnterior.stream().limit(topReal).toList())
                .analisis(analisis)
                .totalVentas(totalVentas)
                .totalUnidades(totalUnidades)
                .totalMonto(totalMonto)
                .build();
    }

    @Override
    @Transactional
    public void registrarVenta(VentaRequestDTO dto) {
        ventaRepository.registrarVenta(
                dto.getIdUsuario(),
                dto.getFechaVenta(),
                dto.getCliente(),
                construirJsonDetalles(dto.getDetalles())
        );
    }

    private String construirJsonDetalles(List<DetalleVentaRequestDTO> detalles) {
        return detalles.stream().map(d -> {
            StringBuilder sb = new StringBuilder("{");
            sb.append("\"id_producto\":").append(d.getIdProducto());
            sb.append(",\"cantidad\":").append(d.getCantidad());
            if (d.getPrecioUnitario() != null) {
                sb.append(",\"precio_unitario\":").append(d.getPrecioUnitario());
            }
            if (d.getIdLote() != null) {
                sb.append(",\"id_lote\":").append(d.getIdLote());
            }
            sb.append("}");
            return sb.toString();
        }).collect(Collectors.joining(",", "[", "]"));
    }

    /**
     * Calcula las ventanas (desde/hasta actuales y del período anterior) según el período solicitado.
     * Períodos de calendario: ESTA_SEMANA, SEMANA_ANTERIOR, ESTE_MES, MES_ANTERIOR.
     * Períodos deslizantes: ULTIMOS_30_DIAS, QUINCENA, QUINCENA_ANTERIOR (y legados SEMANA/MES).
     * PERSONALIZADO: usa los rangos provistos (desde/hasta).
     */
    private Ventana ventana(String periodo, LocalDateTime desdeParam, LocalDateTime hastaParam) {
        if (periodo == null) periodo = "ESTA_SEMANA";
        String p = periodo.toUpperCase();
        LocalDateTime now = LocalDateTime.now();
        return switch (p) {
            case "SEMANA_ANTERIOR" -> {
                LocalDateTime inicioSemana = inicioSemana(now);
                yield new Ventana(inicioSemana.minusDays(7), inicioSemana,
                        inicioSemana.minusDays(14), inicioSemana.minusDays(7));
            }
            case "ESTE_MES" -> {
                LocalDateTime inicioMes = inicioMes(now);
                yield new Ventana(inicioMes, now, inicioMes.minusMonths(1), inicioMes);
            }
            case "MES_ANTERIOR" -> {
                LocalDateTime inicioMes = inicioMes(now);
                yield new Ventana(inicioMes.minusMonths(1), inicioMes,
                        inicioMes.minusMonths(2), inicioMes.minusMonths(1));
            }
            case "ULTIMOS_30_DIAS", "MES" ->
                    new Ventana(now.minusDays(30), now, now.minusDays(60), now.minusDays(30));
            case "QUINCENA" ->
                    new Ventana(now.minusDays(15), now, now.minusDays(30), now.minusDays(15));
            case "QUINCENA_ANTERIOR" ->
                    new Ventana(now.minusDays(30), now.minusDays(15), now.minusDays(45), now.minusDays(30));
            case "PERSONALIZADO" -> {
                if (desdeParam == null || hastaParam == null) {
                    yield new Ventana(now.minusDays(30), now, now.minusDays(60), now.minusDays(30));
                }
                long dias = Math.max(1, Duration.between(desdeParam, hastaParam).toDays());
                yield new Ventana(desdeParam, hastaParam, desdeParam.minusDays(dias), desdeParam);
            }
            default -> {
                LocalDateTime inicioSemana = inicioSemana(now);
                yield new Ventana(inicioSemana, now, inicioSemana.minusDays(7), inicioSemana);
            }
        };
    }

    private LocalDateTime inicioSemana(LocalDateTime dt) {
        return dt.toLocalDate().with(DayOfWeek.MONDAY).atStartOfDay();
    }

    private LocalDateTime inicioMes(LocalDateTime dt) {
        return dt.toLocalDate().withDayOfMonth(1).atStartOfDay();
    }

    private record Ventana(LocalDateTime desde, LocalDateTime hasta, LocalDateTime desdeAnterior, LocalDateTime hastaAnterior) {
    }

    private List<VentaRankingDTO> mapearRanking(List<IVentaRepository.VentaRankingProjection> proyecciones) {
        return proyecciones.stream().map(p -> VentaRankingDTO.builder()
                .idProducto(p.getIdProducto())
                .nombre(p.getNombre())
                .unidades(p.getUnidades())
                .montoTotal(p.getMontoTotal())
                .build()).toList();
    }

    private void calcularVariaciones(List<VentaRankingDTO> ranking, List<VentaRankingDTO> rankingAnterior) {
        Map<Integer, Long> anteriores = new java.util.HashMap<>();
        if (rankingAnterior != null) {
            for (VentaRankingDTO r : rankingAnterior) {
                anteriores.put(r.getIdProducto(), r.getUnidades());
            }
        }
        for (VentaRankingDTO r : ranking) {
            Long anterior = anteriores.get(r.getIdProducto());
            if (anterior == null || anterior == 0) {
                r.setUnidadesAnterior(anterior);
                r.setVariacion(anterior == null ? null : 100.0);
            } else {
                r.setUnidadesAnterior(anterior);
                r.setVariacion((r.getUnidades() - anterior) * 100.0 / anterior);
            }
        }
    }
}
