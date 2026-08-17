package org.uteq.sacpa.service.ia_alertas.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.analisis.*;
import org.uteq.sacpa.repository.analisis.IAnalisisRepository;
import org.uteq.sacpa.service.ia_alertas.IAnalisisService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalisisServiceImpl implements IAnalisisService {

    private final IAnalisisRepository analisisRepository;

    private static final Map<String, LocalDateTime[]> VENTANAS = new HashMap<>();

    static {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lunes = now.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
        VENTANAS.put("ESTA_SEMANA", new LocalDateTime[]{lunes, lunes.plusWeeks(1)});
        VENTANAS.put("SEMANA_ANTERIOR", new LocalDateTime[]{lunes.minusWeeks(1), lunes});
        VENTANAS.put("ESTE_MES", new LocalDateTime[]{now.withDayOfMonth(1).toLocalDate().atStartOfDay(), now.withDayOfMonth(1).plusMonths(1).toLocalDate().atStartOfDay()});
        VENTANAS.put("MES_ANTERIOR", new LocalDateTime[]{now.withDayOfMonth(1).minusMonths(1).toLocalDate().atStartOfDay(), now.withDayOfMonth(1).toLocalDate().atStartOfDay()});
        VENTANAS.put("ULTIMOS_30_DIAS", new LocalDateTime[]{now.minusDays(30), now});
        VENTANAS.put("ULTIMOS_90_DIAS", new LocalDateTime[]{now.minusDays(90), now});
    }

    private LocalDateTime[] ventana(String periodo) {
        LocalDateTime[] v = VENTANAS.get(periodo != null ? periodo.toUpperCase() : "ESTA_SEMANA");
        if (v == null) v = VENTANAS.get("ESTA_SEMANA");
        return v;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoMayorIngresoDTO> mayorIngreso(String periodo) {
        LocalDateTime[] v = ventana(periodo);
        LocalDateTime[] vAnt = {v[0].minusWeeks(1), v[1].minusWeeks(1)};

        List<Object[]> actuales = analisisRepository.mayorIngreso(v[0], v[1]);
        List<Object[]> anteriores = analisisRepository.mayorIngresoPeriodoAnterior(vAnt[0], vAnt[1]);

        Map<Integer, Long> mapaAnterior = new HashMap<>();
        for (Object[] row : anteriores) {
            mapaAnterior.put((Integer) row[0], ((Number) row[2]).longValue());
        }

        List<ProductoMayorIngresoDTO> resultado = new ArrayList<>();
        for (Object[] row : actuales) {
            Integer id = (Integer) row[0];
            Long unidadesAct = ((Number) row[2]).longValue();
            Long unidadesAnt = mapaAnterior.getOrDefault(id, 0L);

            Double variacion = null;
            if (unidadesAnt > 0) {
                variacion = ((double) (unidadesAct - unidadesAnt) / unidadesAnt) * 100;
            }

            resultado.add(ProductoMayorIngresoDTO.builder()
                    .idProducto(id)
                    .nombre((String) row[1])
                    .unidadesVendidas(unidadesAct)
                    .ingresoTotal((BigDecimal) row[3])
                    .ingresoAnterior(unidadesAnt)
                    .variacion(variacion)
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandaTemporadaDTO> demandaTemporada(Integer idTemporada) {
        LocalDateTime fechaInicio = LocalDateTime.now().minusDays(90);
        LocalDateTime fechaFin = LocalDateTime.now();

        List<Object[]> filas = analisisRepository.demandaPorTemporada(fechaInicio, fechaFin);

        long totalUnidades = filas.stream().mapToLong(f -> ((Number) f[2]).longValue()).sum();
        BigDecimal totalMonto = filas.stream()
                .map(f -> (BigDecimal) f[3])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<DemandaTemporadaDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            resultado.add(DemandaTemporadaDTO.builder()
                    .idProducto((Integer) row[0])
                    .nombre((String) row[1])
                    .unidadesVendidas(((Number) row[2]).longValue())
                    .montoTotal((BigDecimal) row[3])
                    .temporada("Últimos 90 días")
                    .totalUnidades(totalUnidades)
                    .totalMonto(totalMonto)
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteProximoVencerDTO> lotesProximosAVencer(Integer dias) {
        if (dias == null || dias <= 0) dias = 30;
        List<Object[]> filas = analisisRepository.lotesProximosAVencer(dias);

        List<LoteProximoVencerDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            Long diasRestantes = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            resultado.add(LoteProximoVencerDTO.builder()
                    .idLote((Integer) row[0])
                    .numeroLote((String) row[1])
                    .nombreProducto((String) row[2])
                    .cantidadActual((Integer) row[3])
                    .fechaVencimiento(row[4] != null ? LocalDate.parse(row[4].toString()) : null)
                    .diasRestantes(diasRestantes)
                    .nivelAlerta((String) row[6])
                    .estadoLote((String) row[7])
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoEstancadoDTO> productosEstancados() {
        List<Object[]> filas = analisisRepository.productosEstancados();

        List<ProductoEstancadoDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            Long diasSinMov = row[4] != null ? ((Number) row[4]).longValue() : null;
            LocalDateTime ultimoMov = null;
            if (row[3] != null) {
                try { ultimoMov = LocalDateTime.parse(row[3].toString().replace(" ", "T")); } catch (Exception ignored) {}
            }
            resultado.add(ProductoEstancadoDTO.builder()
                    .idProducto((Integer) row[0])
                    .nombre((String) row[1])
                    .cantidadActual(((Number) row[2]).intValue())
                    .ultimoMovimiento(ultimoMov)
                    .diasSinMovimiento(diasSinMov)
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioTotalDTO> inventarioTotal() {
        List<Object[]> filas = analisisRepository.inventarioTotal();

        List<InventarioTotalDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            resultado.add(InventarioTotalDTO.builder()
                    .idProducto((Integer) row[0])
                    .nombre((String) row[1])
                    .unidadMedida((String) row[2])
                    .cantidadTotal(((Number) row[3]).longValue())
                    .precioUnitario((BigDecimal) row[4])
                    .valorTotal((BigDecimal) row[5])
                    .lotesActivos(((Number) row[6]).intValue())
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoProductoDTO> movimientosPorRango(LocalDateTime desde, LocalDateTime hasta) {
        List<Object[]> filas = analisisRepository.movimientosPorRango(desde, hasta);

        List<MovimientoProductoDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            resultado.add(MovimientoProductoDTO.builder()
                    .idMovimiento((Integer) row[0])
                    .nombreProducto((String) row[1])
                    .numeroLote((String) row[2])
                    .tipoMovimiento((String) row[3])
                    .naturaleza((String) row[4])
                    .cantidad((Integer) row[5])
                    .fechaMovimiento(row[6] != null ? LocalDateTime.parse(row[6].toString().replace(" ", "T")) : null)
                    .usuario((String) row[7])
                    .observacion((String) row[8])
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public Object estadisticasPromociones() {
        List<Object[]> filas = analisisRepository.estadisticasPromociones();
        if (filas.isEmpty()) return Map.of("aprobadas", 0, "totalSugeridas", 0, "activas", 0, "porcentajeAprobacion", 0.0);

        Object[] row = filas.get(0);
        Integer aprobadas = ((Number) row[0]).intValue();
        Integer total = ((Number) row[1]).intValue();
        Integer activas = ((Number) row[2]).intValue();
        Double porcentaje = total > 0 ? (aprobadas * 100.0 / total) : 0.0;

        return Map.of(
                "aprobadas", aprobadas,
                "totalSugeridas", total,
                "activas", activas,
                "porcentajeAprobacion", BigDecimal.valueOf(porcentaje).setScale(1, RoundingMode.HALF_UP).doubleValue()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoSalvadoDTO> productosSalvados() {
        List<Object[]> filas = analisisRepository.productosSalvados();

        List<ProductoSalvadoDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            resultado.add(ProductoSalvadoDTO.builder()
                    .idLote((Integer) row[0])
                    .numeroLote((String) row[1])
                    .nombreProducto((String) row[2])
                    .cantidadAlertada(((Number) row[3]).intValue())
                    .cantidadVendida(((Number) row[4]).intValue())
                    .fechaVencimiento(row[5] != null ? LocalDate.parse(row[5].toString()) : null)
                    .nombreAlerta((String) row[6])
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioAnulacionDTO> usuariosConAnulaciones(Integer semanas) {
        if (semanas == null || semanas <= 0) semanas = 4;
        LocalDateTime desde = LocalDateTime.now().minusWeeks(semanas);
        List<Object[]> filas = analisisRepository.usuariosConAnulaciones(desde);

        List<UsuarioAnulacionDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            LocalDateTime ultimaOp = null;
            if (row[5] != null) {
                try {
                    ultimaOp = LocalDateTime.parse(row[5].toString().replace(" ", "T"));
                } catch (Exception ignored) {}
            }
            resultado.add(UsuarioAnulacionDTO.builder()
                    .idUsuario(((Number) row[0]).intValue())
                    .correo((String) row[1])
                    .operacion((String) row[2])
                    .tablaAfectada((String) row[3])
                    .totalOperaciones(((Number) row[4]).longValue())
                    .ultimaOperacion(ultimaOp)
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiaCompraDTO> ventasPorDiaSemana(String periodo) {
        LocalDateTime[] v = ventana(periodo);
        List<Object[]> filas = analisisRepository.ventasPorDiaSemana(v[0], v[1]);

        List<DiaCompraDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            resultado.add(DiaCompraDTO.builder()
                    .diaSemana((Integer) row[0])
                    .nombreDia((String) row[1])
                    .totalVentas(((Number) row[2]).longValue())
                    .montoTotal((BigDecimal) row[3])
                    .totalUnidades(((Number) row[4]).longValue())
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteFrecuenteDTO> clientesFrecuentes() {
        List<Object[]> filas = analisisRepository.clientesFrecuentes();

        List<ClienteFrecuenteDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            LocalDateTime ultimaCompra = null;
            if (row[4] != null) {
                try {
                    ultimaCompra = LocalDateTime.parse(row[4].toString().replace(" ", "T"));
                } catch (Exception ignored) {}
            }
            resultado.add(ClienteFrecuenteDTO.builder()
                    .cliente((String) row[0])
                    .totalCompras(((Number) row[1]).longValue())
                    .montoTotal((BigDecimal) row[2])
                    .promedioCompra((BigDecimal) row[3])
                    .ultimaCompra(ultimaCompra)
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DevolucionMensualDTO> devolucionesMensuales(Integer meses) {
        if (meses == null || meses <= 0) meses = 6;
        LocalDateTime desde = LocalDateTime.now().minusMonths(meses);
        List<Object[]> filas = analisisRepository.devolucionesMensuales(desde);

        List<DevolucionMensualDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            resultado.add(DevolucionMensualDTO.builder()
                    .anio(((Number) row[0]).intValue())
                    .mes(((Number) row[1]).intValue())
                    .nombreMes((String) row[2])
                    .totalDevoluciones(((Number) row[3]).longValue())
                    .cantidadTotal(((Number) row[4]).intValue())
                    .motivoPrincipal((String) row[5])
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoTemporadaDTO> productosPorTemporada() {
        List<Object[]> filas = analisisRepository.productosPorTemporada();

        Map<String, Long> totalPorTemporada = new HashMap<>();
        for (Object[] row : filas) {
            String temp = (String) row[2];
            long unidades = ((Number) row[3]).longValue();
            totalPorTemporada.merge(temp, unidades, Long::sum);
        }

        List<ProductoTemporadaDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            String temp = (String) row[2];
            long unidades = ((Number) row[3]).longValue();
            long totalTemp = totalPorTemporada.getOrDefault(temp, 1L);
            double porcentaje = (unidades * 100.0) / totalTemp;

            resultado.add(ProductoTemporadaDTO.builder()
                    .idProducto((Integer) row[0])
                    .nombre((String) row[1])
                    .temporada(temp)
                    .unidadesVendidas(unidades)
                    .montoTotal((BigDecimal) row[4])
                    .totalUnidadesTemporada(totalTemp)
                    .porcentajeParticipacion(BigDecimal.valueOf(porcentaje).setScale(1, RoundingMode.HALF_UP).doubleValue())
                    .build());
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteChurnDTO> clientesChurn() {
        List<Object[]> filas = analisisRepository.clientesChurn();

        List<ClienteChurnDTO> resultado = new ArrayList<>();
        for (Object[] row : filas) {
            Long mesesSinCompra = row[4] != null ? ((Number) row[4]).longValue() : 0L;
            resultado.add(ClienteChurnDTO.builder()
                    .cliente((String) row[0])
                    .comprasAnteriores(((Number) row[1]).longValue())
                    .montoAnterior((BigDecimal) row[2])
                    .ultimaCompra(row[3] != null ? LocalDateTime.parse(row[3].toString().replace(" ", "T")) : null)
                    .mesesSinCompra(mesesSinCompra)
                    .promedioMensual((BigDecimal) row[5])
                    .build());
        }
        return resultado;
    }
}
