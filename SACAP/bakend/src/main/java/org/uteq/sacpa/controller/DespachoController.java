package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.service.operaciones.IDespachoService;

@RestController
@RequestMapping("/api/operaciones/despachos")
@RequiredArgsConstructor
public class DespachoController {

    private final IDespachoService despachoService;

    @PutMapping("/{idVenta}/preparar")
    public ResponseEntity<?> marcarComoPreparada(@PathVariable Integer idVenta) {
        return ResponseEntity.ok(despachoService.marcarComoPreparada(idVenta));
    }

    @PutMapping("/{idVenta}/entregar")
    public ResponseEntity<?> confirmarEntrega(@PathVariable Integer idVenta) {
        return ResponseEntity.ok(despachoService.confirmarEntrega(idVenta));
    }
}
