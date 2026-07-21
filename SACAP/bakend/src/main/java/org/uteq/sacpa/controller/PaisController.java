package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.geografia.PaisRequestDTO;
import org.uteq.sacpa.entity.geografia.Pais;
import org.uteq.sacpa.service.geografia.IPaisService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paises")
public class PaisController {

    @Autowired
    private IPaisService paisService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearPais(@Valid @RequestBody PaisRequestDTO request) {
        paisService.crearPais(request);
        return ResponseEntity.ok(Map.of("mensaje", "Pais creado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Pais>> listarPaises() {
        return ResponseEntity.ok(paisService.listarTodos());
    }

    @PutMapping("/{idPais}")
    public ResponseEntity<Map<String, String>> actualizarPais(
            @PathVariable Integer idPais,
            @Valid @RequestBody PaisRequestDTO request) {
        paisService.actualizarPais(idPais, request);
        return ResponseEntity.ok(Map.of("mensaje", "Pais actualizado exitosamente"));
    }

    @PutMapping("/{idPais}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarPais(@PathVariable Integer idPais) {
        paisService.desactivarPais(idPais);
        return ResponseEntity.ok(Map.of("mensaje", "Pais desactivado exitosamente"));
    }
}
