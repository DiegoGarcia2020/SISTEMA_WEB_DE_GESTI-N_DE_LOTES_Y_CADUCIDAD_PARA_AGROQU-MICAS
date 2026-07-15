package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_modelos.TemporadaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;
import org.uteq.sacpa.service.ia_alertas.ITemporadaService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/temporadas")
public class TemporadaController {

    @Autowired
    private ITemporadaService temporadaService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearTemporada(@Valid @RequestBody TemporadaRequestDTO request) {
        temporadaService.crearTemporada(request);
        return ResponseEntity.ok(Map.of("mensaje", "Temporada agricola registrada exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<TemporadaAgricola>> listarTemporadas() {
        return ResponseEntity.ok(temporadaService.listarTodas());
    }
}
