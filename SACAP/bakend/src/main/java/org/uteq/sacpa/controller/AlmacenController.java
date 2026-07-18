package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.inventario.*;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.service.inventario.IAlmacenService;

import java.util.List;
import java.util.Map;

/**
 * Controlador de Almacenes con endpoints en cascada para la estructura física.
 *
 * GET /api/almacenes                                   → lista todos los almacenes
 * GET /api/almacenes/{id}/zonas                        → zonas de un almacén
 * GET /api/almacenes/zonas/{idZona}/estanterias        → estanterías de una zona
 * GET /api/almacenes/estanterias/{idEst}/ubicaciones   → ubicaciones de una estantería
 */
@RestController
@RequestMapping("/api/almacenes")
@RequiredArgsConstructor
public class AlmacenController {

    private final IAlmacenService almacenService;

    // ── ALMACENES ────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> crearAlmacen(@Valid @RequestBody AlmacenRequestDTO request) {
        almacenService.crearAlmacen(request);
        return ResponseEntity.ok(Map.of("mensaje", "Almacén creado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<AlmacenResponseDTO>> listarAlmacenes() {
        List<AlmacenResponseDTO> lista = almacenService.listarTodos()
                .stream().map(AlmacenResponseDTO::from).toList();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{idAlmacen}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarAlmacen(
            @PathVariable Integer idAlmacen,
            @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        almacenService.desactivarAlmacen(idAlmacen, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Almacén desactivado exitosamente"));
    }

    // ── CASCADA 3.1: Zonas ───────────────────────────────────

    @GetMapping("/{idAlmacen}/zonas")
    public ResponseEntity<List<ZonaAlmacenResponseDTO>> listarZonas(@PathVariable Integer idAlmacen) {
        return ResponseEntity.ok(almacenService.listarZonasPorAlmacen(idAlmacen));
    }

    // ── CASCADA 3.1: Estanterías ─────────────────────────────

    @GetMapping("/zonas/{idZona}/estanterias")
    public ResponseEntity<List<EstanteriaResponseDTO>> listarEstanterias(@PathVariable Integer idZona) {
        return ResponseEntity.ok(almacenService.listarEstanteriasPorZona(idZona));
    }

    // ── CASCADA 3.1: Ubicaciones internas ────────────────────

    @GetMapping("/estanterias/{idEstanteria}/ubicaciones")
    public ResponseEntity<List<UbicacionInternaResponseDTO>> listarUbicaciones(@PathVariable Integer idEstanteria) {
        return ResponseEntity.ok(almacenService.listarUbicacionesPorEstanteria(idEstanteria));
    }
}
