package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_modelos.SugerenciaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;
import org.uteq.sacpa.service.ia_alertas.ISugerenciaIAService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ia/sugerencias")
public class SugerenciaIAController {

    @Autowired
    private ISugerenciaIAService sugerenciaService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearSugerencia(@Valid @RequestBody SugerenciaRequestDTO request) {
        sugerenciaService.crearSugerencia(request);
        return ResponseEntity.ok(Map.of("mensaje", "Sugerencia de IA creada exitosamente"));
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<SugerenciaIA>> buscarPorLote(@PathVariable Integer idLote) {
        return ResponseEntity.ok(sugerenciaService.buscarPorLote(idLote));
    }

    @PutMapping("/{idSugerencia}/estado")
    public ResponseEntity<Map<String, String>> actualizarEstado(
            @PathVariable Integer idSugerencia,
            @RequestParam("idEstadoAprobacion") Integer idEstadoAprobacion) {
        sugerenciaService.actualizarEstadoSugerencia(idSugerencia, idEstadoAprobacion);
        return ResponseEntity.ok(Map.of("mensaje", "Estado de sugerencia actualizado exitosamente"));
    }
}
