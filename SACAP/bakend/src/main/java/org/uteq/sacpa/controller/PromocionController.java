package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_modelos.PromocionRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.Promocion;
import org.uteq.sacpa.service.ia_alertas.IPromocionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ia/promociones")
public class PromocionController {

    @Autowired
    private IPromocionService promocionService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearPromocion(@Valid @RequestBody PromocionRequestDTO request) {
        promocionService.crearPromocion(request);
        return ResponseEntity.ok(Map.of("mensaje", "Promocion creada exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Promocion>> listarPromociones() {
        return ResponseEntity.ok(promocionService.listarTodas());
    }

    @GetMapping({"/activas", "/combos/activos"})
    public ResponseEntity<List<Promocion>> listarActivas() {
        return ResponseEntity.ok(promocionService.listarPorEstado(1)); // 1: Activo/Aprobado
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<Promocion>> listarPendientes() {
        return ResponseEntity.ok(promocionService.listarPorEstado(2)); // 2: Sugerido/Pendiente de aprobación
    }

    @PutMapping("/{idPromocion}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarPromocion(
            @PathVariable Integer idPromocion,
            @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        promocionService.desactivarPromocion(idPromocion, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Promocion desactivada exitosamente"));
    }

    @PutMapping("/{idPromocion}/cambiar-estado")
    public ResponseEntity<Map<String, String>> cambiarEstado(
            @PathVariable Integer idPromocion,
            @RequestParam("idEstado") Integer idEstado) {
        promocionService.cambiarEstadoPromocion(idPromocion, idEstado);
        return ResponseEntity.ok(Map.of("mensaje", "Estado de combo/promoción actualizado exitosamente"));
    }
}
