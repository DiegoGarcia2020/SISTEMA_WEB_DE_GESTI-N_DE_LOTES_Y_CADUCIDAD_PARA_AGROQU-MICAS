package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.inventario.LoteRequestDTO;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.service.inventario.ILoteService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {

    @Autowired
    private ILoteService loteService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearLote(@Valid @RequestBody LoteRequestDTO request) {
        loteService.crearLote(request);
        return ResponseEntity.ok(Map.of("mensaje", "Lote creado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Lote>> listarLotes() {
        return ResponseEntity.ok(loteService.listarTodos());
    }

    @GetMapping("/{numeroLote}")
    public ResponseEntity<Lote> buscarPorNumeroLote(@PathVariable String numeroLote) {
        return ResponseEntity.ok(loteService.buscarPorNumeroLote(numeroLote));
    }

    @GetMapping("/proximos-vencer")
    public ResponseEntity<List<Lote>> lotesProximosVencer(
            @RequestParam("fechaLimite") String fechaLimiteStr,
            @RequestParam("idEstadoActivo") Integer idEstadoActivo) {
        LocalDate fechaLimite = LocalDate.parse(fechaLimiteStr);
        return ResponseEntity.ok(loteService.listarLotesProximosAVencer(fechaLimite, idEstadoActivo));
    }

    @PutMapping("/{idLote}/anular")
    public ResponseEntity<Map<String, String>> anularLote(@PathVariable Integer idLote) {
        loteService.anularLote(idLote);
        return ResponseEntity.ok(Map.of("mensaje", "Lote anulado exitosamente"));
    }
}
