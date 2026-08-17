package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.OrdenPendienteDespachoDTO;
import org.uteq.sacpa.service.operaciones.IDespachoService;

import java.util.List;

@RestController
@RequestMapping("/api/operaciones/despachos")
@RequiredArgsConstructor
public class DespachoController {

    private final IDespachoService despachoService;

    @GetMapping("/pendientes")
    public ResponseEntity<List<OrdenPendienteDespachoDTO>> listarPendientesPreparar(
            @RequestParam(required = false) String busqueda) {
        return ResponseEntity.ok(despachoService.listarPendientesPreparar(busqueda));
    }

    @PutMapping("/{idVenta}/preparar")
    public ResponseEntity<?> marcarComoPreparada(@PathVariable Integer idVenta) {
        return ResponseEntity.ok(despachoService.marcarComoPreparada(idVenta));
    }

    @PutMapping("/{idVenta}/entregar")
    public ResponseEntity<?> confirmarEntrega(@PathVariable Integer idVenta) {
        return ResponseEntity.ok(despachoService.confirmarEntrega(idVenta));
    }
}
