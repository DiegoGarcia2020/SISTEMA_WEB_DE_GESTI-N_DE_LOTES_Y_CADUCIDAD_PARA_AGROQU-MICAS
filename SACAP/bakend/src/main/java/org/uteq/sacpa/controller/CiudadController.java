package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.geografia.CiudadRequestDTO;
import org.uteq.sacpa.entity.geografia.Ciudad;
import org.uteq.sacpa.service.geografia.ICiudadService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ciudades")
public class CiudadController {

    @Autowired
    private ICiudadService ciudadService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearCiudad(@Valid @RequestBody CiudadRequestDTO request) {
        ciudadService.crearCiudad(request);
        return ResponseEntity.ok(Map.of("mensaje", "Ciudad creada exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Ciudad>> listarCiudades() {
        return ResponseEntity.ok(ciudadService.listarTodos());
    }

    @GetMapping("/provincia/{idProvincia}")
    public ResponseEntity<List<Ciudad>> listarPorProvincia(@PathVariable Integer idProvincia) {
        return ResponseEntity.ok(ciudadService.listarPorProvincia(idProvincia));
    }

    @PutMapping("/{idCiudad}")
    public ResponseEntity<Map<String, String>> actualizarCiudad(
            @PathVariable Integer idCiudad,
            @Valid @RequestBody CiudadRequestDTO request) {
        ciudadService.actualizarCiudad(idCiudad, request);
        return ResponseEntity.ok(Map.of("mensaje", "Ciudad actualizada exitosamente"));
    }

    @PutMapping("/{idCiudad}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarCiudad(@PathVariable Integer idCiudad) {
        ciudadService.desactivarCiudad(idCiudad);
        return ResponseEntity.ok(Map.of("mensaje", "Ciudad desactivada exitosamente"));
    }
}
