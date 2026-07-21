package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.geografia.ProvinciaRequestDTO;
import org.uteq.sacpa.entity.geografia.Provincia;
import org.uteq.sacpa.service.geografia.IProvinciaService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/provincias")
public class ProvinciaController {

    @Autowired
    private IProvinciaService provinciaService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearProvincia(@Valid @RequestBody ProvinciaRequestDTO request) {
        provinciaService.crearProvincia(request);
        return ResponseEntity.ok(Map.of("mensaje", "Provincia creada exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Provincia>> listarProvincias() {
        return ResponseEntity.ok(provinciaService.listarTodos());
    }

    @GetMapping("/pais/{idPais}")
    public ResponseEntity<List<Provincia>> listarPorPais(@PathVariable Integer idPais) {
        return ResponseEntity.ok(provinciaService.listarPorPais(idPais));
    }

    @PutMapping("/{idProvincia}")
    public ResponseEntity<Map<String, String>> actualizarProvincia(
            @PathVariable Integer idProvincia,
            @Valid @RequestBody ProvinciaRequestDTO request) {
        provinciaService.actualizarProvincia(idProvincia, request);
        return ResponseEntity.ok(Map.of("mensaje", "Provincia actualizada exitosamente"));
    }

    @PutMapping("/{idProvincia}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarProvincia(@PathVariable Integer idProvincia) {
        provinciaService.desactivarProvincia(idProvincia);
        return ResponseEntity.ok(Map.of("mensaje", "Provincia desactivada exitosamente"));
    }
}
