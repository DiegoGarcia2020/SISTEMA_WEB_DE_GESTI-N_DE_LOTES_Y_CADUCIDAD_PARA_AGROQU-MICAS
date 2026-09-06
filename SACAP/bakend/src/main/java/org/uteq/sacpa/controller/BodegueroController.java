package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_alertas.AlertaCaducidadResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.MiBodegaDTO;
import org.uteq.sacpa.dto.inventario.NodoTopologiaDTO;
import org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO;
import org.uteq.sacpa.dto.operaciones.OrdenPendienteDespachoDTO;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.inventario.IBodegueroService;

import java.util.List;

/**
 * Endpoints del propio Bodeguero, acotados a la bodega que le asignó su Supervisor.
 *
 * GET /api/bodeguero/mi-bodega                     → bodega asignada (204 si no tiene)
 * GET /api/bodeguero/lotes-disponibles-fefo         → lotes con stock, orden FEFO, solo mi bodega
 * GET /api/bodeguero/alertas                        → alertas de caducidad, solo mi bodega
 * GET /api/bodeguero/despachos/pendientes           → ventas confirmadas por preparar, solo mi bodega
 * GET /api/bodeguero/despachos/pendientes-entrega   → ventas preparadas por entregar, solo mi bodega
 * GET /api/bodeguero/topologia                      → árbol de zonas/estanterías/ubicaciones, solo mi bodega
 */
@RestController
@RequestMapping("/api/bodeguero")
@RequiredArgsConstructor
public class BodegueroController {

    private final IBodegueroService bodegueroService;

    @GetMapping("/mi-bodega")
    public ResponseEntity<MiBodegaDTO> miBodega() {
        return bodegueroService.miBodega(idUsuarioAutenticado())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/lotes-disponibles-fefo")
    public ResponseEntity<List<LoteDisponibleDTO>> lotesDisponiblesFefo() {
        return ResponseEntity.ok(bodegueroService.lotesDisponiblesFefo(idUsuarioAutenticado()));
    }

    @GetMapping("/alertas")
    public ResponseEntity<Page<AlertaCaducidadResponseDTO>> alertas(
            @RequestParam(value = "idEstadoActivo", required = false) Integer idEstadoActivo,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bodegueroService.alertas(idUsuarioAutenticado(), idEstadoActivo, pageable));
    }

    @GetMapping("/despachos/pendientes")
    public ResponseEntity<List<OrdenPendienteDespachoDTO>> despachosPendientes(
            @RequestParam(required = false) String busqueda) {
        return ResponseEntity.ok(bodegueroService.despachosPendientes(idUsuarioAutenticado(), busqueda));
    }

    @GetMapping("/despachos/pendientes-entrega")
    public ResponseEntity<List<OrdenPendienteDespachoDTO>> despachosPendientesEntrega(
            @RequestParam(required = false) String busqueda) {
        return ResponseEntity.ok(bodegueroService.despachosPendientesEntrega(idUsuarioAutenticado(), busqueda));
    }

    @GetMapping("/topologia")
    public ResponseEntity<List<NodoTopologiaDTO>> arbolTopologia() {
        return ResponseEntity.ok(bodegueroService.arbolTopologia(idUsuarioAutenticado()));
    }

    @GetMapping("/lotes-pendientes")
    public ResponseEntity<List<LoteResponseDTO>> lotesPendientesDeUbicar(
            @RequestParam(value = "idEstadoPendiente", defaultValue = "2") Integer idEstadoPendiente) {
        return ResponseEntity.ok(bodegueroService.lotesPendientesDeUbicar(idUsuarioAutenticado(), idEstadoPendiente));
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
