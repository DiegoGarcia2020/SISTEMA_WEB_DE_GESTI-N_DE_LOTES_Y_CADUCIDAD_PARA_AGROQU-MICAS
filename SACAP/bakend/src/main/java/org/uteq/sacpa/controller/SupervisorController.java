package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.inventario.BodegueroDisponibleDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteSupervisorRequestDTO;
import org.uteq.sacpa.dto.inventario.MiBodegaDTO;
import org.uteq.sacpa.entity.inventario.Categoria;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.inventario.ISupervisorService;

import java.util.List;
import java.util.Map;

/**
 * Dashboard del Supervisor (Módulo 2 — Reestructuración de Roles):
 * ver las bodegas asignadas y crear/consultar lotes con categoría en ellas.
 *
 * GET    /api/supervisor/mis-bodegas             → bodegas asignadas al supervisor logueado
 * GET    /api/supervisor/lotes?idAlmacen=X       → lotes de una bodega (opcional: idCategoria)
 * POST   /api/supervisor/lotes                   → crea un lote dentro de una bodega del supervisor
 * GET    /api/supervisor/categorias              → categorías de producto disponibles
 * GET    /api/supervisor/bodegueros?idAlmacen=X  → bodegueros asignados a esa bodega
 * GET    /api/supervisor/bodegueros-disponibles  → todos los usuarios con rol Bodeguero
 * POST   /api/supervisor/bodegueros/asignar      → asigna/reasigna un bodeguero a una bodega
 * DELETE /api/supervisor/bodegueros              → quita un bodeguero de una bodega
 */
@RestController
@RequestMapping("/api/supervisor")
@RequiredArgsConstructor
public class SupervisorController {

    private final ISupervisorService supervisorService;

    @GetMapping("/mis-bodegas")
    public ResponseEntity<List<MiBodegaDTO>> misBodegas() {
        return ResponseEntity.ok(supervisorService.misBodegas(idUsuarioAutenticado()));
    }

    @GetMapping("/lotes")
    public ResponseEntity<List<LoteResponseDTO>> misLotes(
            @RequestParam("idAlmacen") Integer idAlmacen,
            @RequestParam(value = "idCategoria", required = false) Integer idCategoria) {
        return ResponseEntity.ok(supervisorService.misLotes(idUsuarioAutenticado(), idAlmacen, idCategoria));
    }

    @PostMapping("/lotes")
    public ResponseEntity<LoteResponseDTO> crearLote(@Valid @RequestBody LoteSupervisorRequestDTO request) {
        return ResponseEntity.status(201).body(supervisorService.crearLote(idUsuarioAutenticado(), request));
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> categorias() {
        return ResponseEntity.ok(supervisorService.categoriasActivas());
    }

    @GetMapping("/bodegueros")
    public ResponseEntity<List<BodegueroDisponibleDTO>> bodeguerosDeMiBodega(@RequestParam("idAlmacen") Integer idAlmacen) {
        return ResponseEntity.ok(supervisorService.bodeguerosDeMiBodega(idUsuarioAutenticado(), idAlmacen));
    }

    @GetMapping("/bodegueros-disponibles")
    public ResponseEntity<List<BodegueroDisponibleDTO>> bodeguerosDisponibles() {
        return ResponseEntity.ok(supervisorService.bodeguerosDisponibles(idUsuarioAutenticado()));
    }

    public record AsignarBodegueroRequest(Integer idAlmacen, Integer idUsuarioBodeguero) {}

    @PostMapping("/bodegueros/asignar")
    public ResponseEntity<BodegueroDisponibleDTO> asignarBodeguero(@RequestBody AsignarBodegueroRequest request) {
        return ResponseEntity.ok(supervisorService.asignarBodeguero(idUsuarioAutenticado(), request.idAlmacen(), request.idUsuarioBodeguero()));
    }

    @DeleteMapping("/bodegueros")
    public ResponseEntity<Map<String, String>> quitarBodeguero(
            @RequestParam("idAlmacen") Integer idAlmacen,
            @RequestParam("idUsuarioBodeguero") Integer idUsuarioBodeguero) {
        supervisorService.quitarBodeguero(idUsuarioAutenticado(), idAlmacen, idUsuarioBodeguero);
        return ResponseEntity.ok(Map.of("mensaje", "Bodeguero removido de la bodega exitosamente"));
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
