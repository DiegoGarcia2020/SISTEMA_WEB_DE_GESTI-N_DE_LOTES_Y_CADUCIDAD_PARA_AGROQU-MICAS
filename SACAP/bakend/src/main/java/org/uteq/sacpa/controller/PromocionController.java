package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_modelos.PromocionRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.ia_alertas.IPromocionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionController {

    private final IPromocionService promocionService;

    @PostMapping
    public ResponseEntity<PromocionResponseDTO> crearPromocion(@Valid @RequestBody PromocionRequestDTO request) {
        return ResponseEntity.status(201).body(promocionService.crearPromocion(request, idUsuarioAutenticado()));
    }

    @GetMapping
    public ResponseEntity<List<PromocionResponseDTO>> listarPromociones() {
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
