package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.inventario.*;
import org.uteq.sacpa.service.inventario.IDocumentoLoteService;
import org.uteq.sacpa.service.inventario.ILoteService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controlador de Lotes SACPA.
 *
 * POST /api/lotes/pre-registro              → Formulario A (Proveedor declara lote)
 * PUT  /api/lotes/{id}/validar              → Formulario B (Bodeguero valida y asigna ubicación)
 * GET  /api/lotes                           → Todos los lotes (DTOs seguros)
 * GET  /api/lotes/fefo                      → Lotes ACTIVOS ordenados por vencimiento ASC
 * GET  /api/lotes/pendientes                → Lotes en estado EN_REVISION
 * GET  /api/lotes/{numeroLote}              → Detalle de un lote
 * GET  /api/lotes/proximos-vencer           → Alertas de caducidad
 * PUT  /api/lotes/{idLote}/anular           → Anular lote
 * GET  /api/lotes/{idLote}/documentos       → Documentos adjuntos del lote
 */
@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LoteController {

    private final ILoteService         loteService;
    private final IDocumentoLoteService documentoService;

    // ── Formulario A — Pre-registro (PROVEEDOR) ───────────────

    @PostMapping("/pre-registro")
    public ResponseEntity<LoteResponseDTO> preRegistrarLote(@Valid @RequestBody LotePreRegistroDTO request) {
        return ResponseEntity.status(201).body(loteService.preRegistrarLote(request));
    }

    // ── Formulario B — Validación (BODEGUERO) ─────────────────

    @PutMapping("/{idLote}/validar")
    public ResponseEntity<LoteResponseDTO> validarLote(
            @PathVariable Integer idLote,
            @Valid @RequestBody LoteValidacionDTO request) {
        return ResponseEntity.ok(loteService.validarLote(idLote, request));
    }

    // ── Creación directa (admin) ──────────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, String>> crearLote(@Valid @RequestBody LoteRequestDTO request) {
        loteService.crearLote(request);
        return ResponseEntity.ok(Map.of("mensaje", "Lote creado exitosamente"));
    }

    // ── Consultas ─────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<LoteResponseDTO>> listarLotes() {
        return ResponseEntity.ok(loteService.listarTodos());
    }

    /**
     * FEFO — lotes activos ordenados por fecha_vencimiento ASC.
     * Parámetro opcional: idProducto para filtrar por producto específico.
     * El módulo de despachos (Módulo 4) consume este endpoint.
     */
    @GetMapping("/fefo")
    public ResponseEntity<List<LoteResponseDTO>> listarFEFO(
            @RequestParam(value = "idEstadoActivo", defaultValue = "1") Integer idEstadoActivo,
            @RequestParam(value = "idProducto",     required = false)   Integer idProducto) {
        return ResponseEntity.ok(loteService.listarFEFO(idEstadoActivo, idProducto));
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<LoteResponseDTO>> listarPendientes(
            @RequestParam(value = "idEstadoPendiente", defaultValue = "2") Integer idEstadoPendiente) {
        return ResponseEntity.ok(loteService.listarPendientesValidacion(idEstadoPendiente));
    }

    @GetMapping("/{numeroLote}")
    public ResponseEntity<LoteResponseDTO> buscarPorNumeroLote(@PathVariable String numeroLote) {
        return ResponseEntity.ok(loteService.buscarPorNumeroLote(numeroLote));
    }

    @GetMapping("/proximos-vencer")
    public ResponseEntity<List<LoteResponseDTO>> lotesProximosVencer(
            @RequestParam("fechaLimite")     String  fechaLimiteStr,
            @RequestParam("idEstadoActivo")  Integer idEstadoActivo) {
        LocalDate fechaLimite = LocalDate.parse(fechaLimiteStr);
        return ResponseEntity.ok(loteService.listarLotesProximosAVencer(fechaLimite, idEstadoActivo));
    }

    @PutMapping("/{idLote}/anular")
    public ResponseEntity<Map<String, String>> anularLote(@PathVariable Integer idLote) {
        loteService.anularLote(idLote);
        return ResponseEntity.ok(Map.of("mensaje", "Lote anulado exitosamente"));
    }

    // ── Documentos del lote ───────────────────────────────────

    @GetMapping("/{idLote}/documentos")
    public ResponseEntity<List<DocumentoLoteResponseDTO>> listarDocumentos(@PathVariable Integer idLote) {
        return ResponseEntity.ok(documentoService.listarPorLote(idLote));
    }
}
