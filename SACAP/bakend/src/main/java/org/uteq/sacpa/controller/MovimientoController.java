package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.MovimientoRequestDTO;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;
import org.uteq.sacpa.service.operaciones.IMovimientoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    @Autowired
    private IMovimientoService movimientoService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearMovimiento(@Valid @RequestBody MovimientoRequestDTO request) {
        movimientoService.crearMovimiento(request);
        return ResponseEntity.ok(Map.of("mensaje", "Movimiento creado exitosamente"));
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<MovimientoInventario>> buscarPorLote(@PathVariable Integer idLote) {
        return ResponseEntity.ok(movimientoService.buscarPorLote(idLote));
    }

    @PutMapping("/{idMovimiento}/anular")
    public ResponseEntity<Map<String, String>> anularMovimiento(
            @PathVariable Integer idMovimiento,
            @RequestParam("idEstadoAnulado") Integer idEstadoAnulado) {
        movimientoService.anularMovimiento(idMovimiento, idEstadoAnulado);
        return ResponseEntity.ok(Map.of("mensaje", "Movimiento anulado exitosamente"));
    }

    @PostMapping("/despachos-fefo")
    public ResponseEntity<Map<String, String>> despacharFefo(@Valid @RequestBody org.uteq.sacpa.dto.operaciones.DespachoRequestDTO request) {
        movimientoService.despacharFefo(request);
        return ResponseEntity.ok(Map.of("mensaje", "Despacho FEFO registrado exitosamente y enviado a aprobación del Supervisor"));
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<MovimientoInventario>> listarPendientes() {
        return ResponseEntity.ok(movimientoService.listarPendientes());
    }

    @GetMapping
    public ResponseEntity<List<MovimientoInventario>> listarTodos() {
        return ResponseEntity.ok(movimientoService.listarTodos());
    }

    @PutMapping("/{idMovimiento}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarDespacho(
            @PathVariable Integer idMovimiento,
            @RequestParam(value = "observacion", required = false) String observacion) {
        movimientoService.aprobarDespacho(idMovimiento, observacion);
        return ResponseEntity.ok(Map.of("mensaje", "Despacho aprobado exitosamente por el Supervisor"));
    }

    @PutMapping("/{idMovimiento}/rechazar")
    public ResponseEntity<Map<String, String>> rechazarDespacho(
            @PathVariable Integer idMovimiento,
            @RequestParam(value = "observacion", required = false) String observacion) {
        movimientoService.rechazarDespacho(idMovimiento, observacion);
        return ResponseEntity.ok(Map.of("mensaje", "Despacho rechazado por el Supervisor"));
    }

    @GetMapping("/lotes-disponibles")
    public ResponseEntity<List<org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO>> listarLotesDisponiblesFefo() {
        return ResponseEntity.ok(movimientoService.listarLotesDisponiblesFefo());
    }
}
