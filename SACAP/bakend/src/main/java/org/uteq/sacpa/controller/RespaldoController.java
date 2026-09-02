package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.service.seguridad.IRespaldoService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/respaldo")
@RequiredArgsConstructor
public class RespaldoController {

    private final IRespaldoService respaldoService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> generarRespaldo(@RequestBody Map<String, String> payload) {
        String tipo = payload.getOrDefault("tipo", "FULL");
        Map<String, Object> resultado = respaldoService.ejecutarRespaldo(tipo);
        
        int exitCode = (int) resultado.get("exitCode");
        if (exitCode == 0) {
            return ResponseEntity.ok(resultado);
        } else {
            return ResponseEntity.status(500).body(resultado);
        }
    }
}
