package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.dto.operaciones.VentaCreateRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaDashboardResponseDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;
import org.uteq.sacpa.entity.catalogos.CatCultivo;
import org.uteq.sacpa.entity.catalogos.CatPlaga;
import org.uteq.sacpa.entity.inventario.Categoria;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.operaciones.IVentaService;

import java.util.List;

/**
 * Módulo 3 — Ventas del Técnico de Campo.
 *
 * GET  /api/ventas/dashboard      → temporadas activas + promociones activas + KPIs del día
 * GET  /api/ventas/sugerencias    → Motor de Sugerencias (por categoría/"problema")
 * POST /api/ventas                → checkout atómico (crea Venta + reserva stock)
 * GET  /api/ventas                → historial del técnico autenticado
 * GET  /api/ventas/{idVenta}      → detalle de una orden
 */
@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final IVentaService ventaService;

    @GetMapping("/dashboard")
    public ResponseEntity<VentaDashboardResponseDTO> dashboard() {
        return ResponseEntity.ok(ventaService.obtenerDashboard(idUsuarioAutenticado()));
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<Categoria>> categorias() {
        return ResponseEntity.ok(ventaService.obtenerCategorias());
    }

    @GetMapping("/sugerencias")
    public ResponseEntity<List<SugerenciaComboDTO>> sugerencias(@RequestParam("idCategoria") Integer idCategoria) {
        return ResponseEntity.ok(ventaService.obtenerSugerencias(idCategoria));
    }

    @GetMapping("/cultivos")
    public ResponseEntity<List<CatCultivo>> cultivos() {
        return ResponseEntity.ok(ventaService.obtenerCultivos());
    }

    @GetMapping("/plagas")
    public ResponseEntity<List<CatPlaga>> plagas() {
        return ResponseEntity.ok(ventaService.obtenerPlagas());
    }

    /** Motor de Sugerencias por diagnóstico: el Técnico elige cultivo (opcional) + plaga */
    @GetMapping("/sugerencias-plaga")
    public ResponseEntity<List<SugerenciaComboDTO>> sugerenciasPorPlaga(
            @RequestParam("idPlaga") Integer idPlaga,
            @RequestParam(value = "idCultivo", required = false) Integer idCultivo) {
        return ResponseEntity.ok(ventaService.obtenerSugerenciasPorPlaga(idPlaga, idCultivo));
    }

    @PostMapping
    public ResponseEntity<VentaResponseDTO> crearVenta(@Valid @RequestBody VentaCreateRequestDTO request) {
        return ResponseEntity.status(201).body(ventaService.crearVenta(idUsuarioAutenticado(), request));
    }

    @GetMapping
    public ResponseEntity<List<VentaResponseDTO>> misVentas() {
        return ResponseEntity.ok(ventaService.misVentas(idUsuarioAutenticado()));
    }

    @GetMapping("/{idVenta}")
    public ResponseEntity<VentaResponseDTO> obtenerVenta(@PathVariable Integer idVenta) {
        return ResponseEntity.ok(ventaService.obtenerVenta(idVenta));
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
