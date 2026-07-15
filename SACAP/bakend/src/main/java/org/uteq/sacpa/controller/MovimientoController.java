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
}
