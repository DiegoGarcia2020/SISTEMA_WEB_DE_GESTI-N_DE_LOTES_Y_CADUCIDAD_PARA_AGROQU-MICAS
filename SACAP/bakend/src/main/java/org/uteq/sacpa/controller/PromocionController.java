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

    @PutMapping("/{idPromocion}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarPromocion(
            @PathVariable Integer idPromocion,
            @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        promocionService.desactivarPromocion(idPromocion, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Promocion desactivada exitosamente"));
    }
}
