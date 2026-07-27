package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_modelos.TemporadaRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.TemporadaResponseDTO;
import org.uteq.sacpa.service.ia_alertas.ITemporadaService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/temporadas")
@RequiredArgsConstructor
public class TemporadaController {

    private final ITemporadaService temporadaService;

    @PostMapping
    public ResponseEntity<TemporadaResponseDTO> crearTemporada(@Valid @RequestBody TemporadaRequestDTO request) {
        return ResponseEntity.status(201).body(temporadaService.crearTemporada(request));
    }

    @GetMapping
    public ResponseEntity<List<TemporadaResponseDTO>> listarTemporadas() {
        return ResponseEntity.ok(temporadaService.listarTodas());
    }

    @PatchMapping("/{idTemporada}/estado")
    public ResponseEntity<Map<String, String>> cambiarEstado(
            @PathVariable Integer idTemporada, @RequestBody Map<String, String> body) {
        temporadaService.cambiarEstado(idTemporada, body.get("estado"));
        return ResponseEntity.ok(Map.of("mensaje", "Estado de temporada actualizado"));
    }
}
