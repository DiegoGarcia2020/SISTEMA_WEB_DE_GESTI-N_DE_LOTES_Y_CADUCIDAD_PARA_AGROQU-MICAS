package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.UsoCampoRequestDTO;
import org.uteq.sacpa.entity.operaciones.UsoCampo;
import org.uteq.sacpa.service.operaciones.IUsoCampoService;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/uso-campo")
public class UsoCampoController {

    @Autowired
    private IUsoCampoService usoCampoService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearUsoCampo(@Valid @RequestBody UsoCampoRequestDTO request) {
        usoCampoService.crearUsoCampo(request);
        return ResponseEntity.ok(Map.of("mensaje", "Uso de campo registrado exitosamente"));
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<UsoCampo>> buscarPorLote(@PathVariable Integer idLote) {
        return ResponseEntity.ok(usoCampoService.buscarPorLote(idLote));
    }

    @PutMapping("/{idUsoCampo}/anular")
    public ResponseEntity<Map<String, String>> anularUsoCampo(
            @PathVariable Integer idUsoCampo,
            @RequestParam("idEstadoAnulado") Integer idEstadoAnulado) {
        usoCampoService.anularUsoCampo(idUsoCampo, idEstadoAnulado);
        return ResponseEntity.ok(Map.of("mensaje", "Uso de campo anulado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<UsoCampo>> listarTodos() {
        return ResponseEntity.ok(usoCampoService.listarTodos());
    }

    @GetMapping("/filtrado")
    public ResponseEntity<List<UsoCampo>> listarFiltrado(
            @RequestParam(value = "fechaInicio", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(value = "fechaFin", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(value = "cultivo", required = false) String cultivo) {
        return ResponseEntity.ok(usoCampoService.listarFiltrado(fechaInicio, fechaFin, cultivo));
    }
}
