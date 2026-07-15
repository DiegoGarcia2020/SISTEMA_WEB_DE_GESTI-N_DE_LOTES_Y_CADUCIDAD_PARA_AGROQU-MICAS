package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_alertas.AlertaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.AlertaCaducidad;
import org.uteq.sacpa.service.ia_alertas.IAlertaCaducidadService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alertas")
public class AlertaController {

    @Autowired
    private IAlertaCaducidadService alertaService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearAlerta(@Valid @RequestBody AlertaRequestDTO request) {
        alertaService.crearAlerta(request);
        return ResponseEntity.ok(Map.of("mensaje", "Alerta de caducidad creada exitosamente"));
    }

    @GetMapping("/activas")
    public ResponseEntity<List<AlertaCaducidad>> listarAlertasActivas(@RequestParam("idEstadoActivo") Integer idEstadoActivo) {
        return ResponseEntity.ok(alertaService.listarAlertasActivas(idEstadoActivo));
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<AlertaCaducidad>> buscarPorLote(@PathVariable Integer idLote) {
        return ResponseEntity.ok(alertaService.buscarPorLote(idLote));
    }

    @PutMapping("/{idAlerta}/descartar")
    public ResponseEntity<Map<String, String>> descartarAlerta(
            @PathVariable Integer idAlerta,
            @RequestParam("idEstadoDescartado") Integer idEstadoDescartado) {
        alertaService.descartarAlerta(idAlerta, idEstadoDescartado);
        return ResponseEntity.ok(Map.of("mensaje", "Alerta descartada exitosamente"));
    }
}
