package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_modelos.ModeloIARequestDTO;
import org.uteq.sacpa.entity.ia_alertas.ModeloIA;
import org.uteq.sacpa.service.ia_alertas.IModeloIAService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ia/modelos")
public class ModeloIAController {

    @Autowired
    private IModeloIAService modeloService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearModelo(@Valid @RequestBody ModeloIARequestDTO request) {
        modeloService.crearModelo(request);
        return ResponseEntity.ok(Map.of("mensaje", "Modelo de IA registrado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<ModeloIA>> listarModelos() {
        return ResponseEntity.ok(modeloService.listarTodos());
    }

    @PutMapping("/{idModelo}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarModelo(
            @PathVariable Integer idModelo,
            @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        modeloService.desactivarModelo(idModelo, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Modelo de IA desactivado exitosamente"));
    }
}
