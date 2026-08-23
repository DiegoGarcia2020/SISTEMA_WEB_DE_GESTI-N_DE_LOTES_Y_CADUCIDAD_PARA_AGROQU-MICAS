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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<Page<PromocionResponseDTO>> listarPromociones(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(promocionService.listarTodas(pageable));
    }


    @GetMapping({"/activas", "/combos/activos"})
    public ResponseEntity<Page<PromocionResponseDTO>> listarActivas(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(promocionService.listarPorEstadoNombre("ACTIVA", pageable));
    }

    @GetMapping("/pendientes")
    public ResponseEntity<Page<PromocionResponseDTO>> listarPendientes(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(promocionService.listarPorEstadoNombre("SUGERIDA", pageable));
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

    /** Cambia el estado de una promoción resolviendo el nombre contra catalogos.cat_estado_promocion */
    @PatchMapping("/{idPromocion}/estado")
    public ResponseEntity<Map<String, String>> cambiarEstadoPorNombre(
            @PathVariable Integer idPromocion,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        if (estado == null || estado.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El campo 'estado' es obligatorio"));
        }
        promocionService.cambiarEstado(idPromocion, estado);
        return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado a " + estado.toUpperCase()));
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
