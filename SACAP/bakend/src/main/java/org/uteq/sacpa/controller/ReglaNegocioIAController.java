package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_modelos.ReglaNegocioIARequestDTO;
import org.uteq.sacpa.dto.ia_modelos.ReglaNegocioIAResponseDTO;
import org.uteq.sacpa.service.ia_alertas.IReglaNegocioIAService;

@RestController
@RequestMapping("/api/ia/reglas")
@RequiredArgsConstructor
public class ReglaNegocioIAController {

    private final IReglaNegocioIAService reglaService;

    @GetMapping
    public ResponseEntity<ReglaNegocioIAResponseDTO> obtenerRegla() {
        return ResponseEntity.ok(reglaService.obtenerRegla());
    }

    @PutMapping
    public ResponseEntity<ReglaNegocioIAResponseDTO> actualizarRegla(@Valid @RequestBody ReglaNegocioIARequestDTO request) {
        return ResponseEntity.ok(reglaService.actualizarRegla(request));
    }
}
