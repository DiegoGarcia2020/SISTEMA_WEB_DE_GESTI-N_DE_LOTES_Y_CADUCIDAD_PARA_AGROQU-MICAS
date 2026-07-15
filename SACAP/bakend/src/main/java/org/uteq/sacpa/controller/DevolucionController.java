package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.DevolucionRequestDTO;
import org.uteq.sacpa.entity.operaciones.Devolucion;
import org.uteq.sacpa.service.operaciones.IDevolucionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devoluciones")
public class DevolucionController {

    @Autowired
    private IDevolucionService devolucionService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearDevolucion(@Valid @RequestBody DevolucionRequestDTO request) {
        devolucionService.crearDevolucion(request);
        return ResponseEntity.ok(Map.of("mensaje", "Devolucion creada exitosamente"));
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<Devolucion>> buscarPorLote(@PathVariable Integer idLote) {
        return ResponseEntity.ok(devolucionService.buscarPorLote(idLote));
    }

    @PutMapping("/{idDevolucion}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarDevolucion(
            @PathVariable Integer idDevolucion,
            @RequestParam("idUsuarioAprobador") Integer idUsuarioAprobador,
            @RequestParam(value = "observacionesAprobador", required = false) String observacionesAprobador,
            @RequestParam("idEstadoAprobado") Integer idEstadoAprobado) {
        devolucionService.aprobarDevolucion(idDevolucion, idUsuarioAprobador, observacionesAprobador, idEstadoAprobado);
        return ResponseEntity.ok(Map.of("mensaje", "Devolucion aprobada exitosamente"));
    }

    @PutMapping("/{idDevolucion}/anular")
    public ResponseEntity<Map<String, String>> anularDevolucion(
            @PathVariable Integer idDevolucion,
            @RequestParam("idEstadoAnulado") Integer idEstadoAnulado) {
        devolucionService.anularDevolucion(idDevolucion, idEstadoAnulado);
        return ResponseEntity.ok(Map.of("mensaje", "Devolucion anulada exitosamente"));
    }
}
