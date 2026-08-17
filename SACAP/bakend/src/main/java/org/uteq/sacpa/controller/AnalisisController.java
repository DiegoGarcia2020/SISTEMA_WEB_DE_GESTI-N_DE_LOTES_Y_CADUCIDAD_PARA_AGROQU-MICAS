package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.analisis.*;
import org.uteq.sacpa.service.ia_alertas.IAnalisisService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ia/analisis")
@RequiredArgsConstructor
public class AnalisisController {

    private final IAnalisisService analisisService;

    @GetMapping("/mayor-ingreso")
    public ResponseEntity<List<ProductoMayorIngresoDTO>> mayorIngreso(
            @RequestParam(defaultValue = "ESTA_SEMANA") String periodo) {
        return ResponseEntity.ok(analisisService.mayorIngreso(periodo));
    }

    @GetMapping("/demanda-temporada")
    public ResponseEntity<List<DemandaTemporadaDTO>> demandaTemporada(
            @RequestParam(required = false) Integer idTemporada) {
        return ResponseEntity.ok(analisisService.demandaTemporada(idTemporada));
    }

    @GetMapping("/caducidad")
    public ResponseEntity<List<LoteProximoVencerDTO>> lotesProximosAVencer(
            @RequestParam(defaultValue = "30") Integer dias) {
        return ResponseEntity.ok(analisisService.lotesProximosAVencer(dias));
    }

    @GetMapping("/inventario-estancado")
    public ResponseEntity<List<ProductoEstancadoDTO>> productosEstancados() {
        return ResponseEntity.ok(analisisService.productosEstancados());
    }

    @GetMapping("/inventario-total")
    public ResponseEntity<List<InventarioTotalDTO>> inventarioTotal() {
        return ResponseEntity.ok(analisisService.inventarioTotal());
    }

    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoProductoDTO>> movimientosPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(analisisService.movimientosPorRango(desde, hasta));
    }

    @GetMapping("/promociones-estadisticas")
    public ResponseEntity<Object> estadisticasPromociones() {
        return ResponseEntity.ok(analisisService.estadisticasPromociones());
    }

    @GetMapping("/productos-salvados")
    public ResponseEntity<List<ProductoSalvadoDTO>> productosSalvados() {
        return ResponseEntity.ok(analisisService.productosSalvados());
    }

    @GetMapping("/anulaciones")
    public ResponseEntity<List<UsuarioAnulacionDTO>> usuariosConAnulaciones(
            @RequestParam(defaultValue = "4") Integer semanas) {
        return ResponseEntity.ok(analisisService.usuariosConAnulaciones(semanas));
    }

    @GetMapping("/dias-compra")
    public ResponseEntity<List<DiaCompraDTO>> ventasPorDiaSemana(
            @RequestParam(defaultValue = "ESTA_SEMANA") String periodo) {
        return ResponseEntity.ok(analisisService.ventasPorDiaSemana(periodo));
    }

    @GetMapping("/clientes-frecuentes")
    public ResponseEntity<List<ClienteFrecuenteDTO>> clientesFrecuentes() {
        return ResponseEntity.ok(analisisService.clientesFrecuentes());
    }

    @GetMapping("/devoluciones-mensuales")
    public ResponseEntity<List<DevolucionMensualDTO>> devolucionesMensuales(
            @RequestParam(defaultValue = "6") Integer meses) {
        return ResponseEntity.ok(analisisService.devolucionesMensuales(meses));
    }

    @GetMapping("/productos-temporada")
    public ResponseEntity<List<ProductoTemporadaDTO>> productosPorTemporada() {
        return ResponseEntity.ok(analisisService.productosPorTemporada());
    }

    @GetMapping("/churn-clientes")
    public ResponseEntity<List<ClienteChurnDTO>> clientesChurn() {
        return ResponseEntity.ok(analisisService.clientesChurn());
    }
}
