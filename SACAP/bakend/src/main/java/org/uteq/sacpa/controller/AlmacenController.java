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
 * Controlador de Almacenes con endpoints para Topología Física (árbol, creación dinámica),
 * Generación de Código QR y Auditoría Rápida Móvil.
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

    @PutMapping("/{idAlmacen}")
    public ResponseEntity<Map<String, String>> actualizarAlmacen(
            @PathVariable Integer idAlmacen, @Valid @RequestBody AlmacenRequestDTO request) {
        almacenService.actualizarAlmacen(idAlmacen, request);
        return ResponseEntity.ok(Map.of("mensaje", "Almacén actualizado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<AlmacenResponseDTO>> listarAlmacenes() {
        return ResponseEntity.ok(almacenService.listarTodos());
    }

    @PutMapping("/{idAlmacen}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarAlmacen(
            @PathVariable Integer idAlmacen,
            @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        almacenService.desactivarAlmacen(idAlmacen, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Almacén desactivado exitosamente"));
    }

    // ── Datos de apoyo para el formulario "Nueva Bodega" (solo Admin) ──

    @GetMapping("/ciudades")
    public ResponseEntity<List<Map<String, Object>>> listarCiudades() {
        List<Map<String, Object>> lista = almacenService.listarCiudades().stream()
                .map(c -> Map.<String, Object>of("idCiudad", c.getIdCiudad(), "nombre", c.getNombre()))
                .toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/supervisores")
    public ResponseEntity<List<SupervisorOpcionDTO>> listarSupervisoresDisponibles() {
        return ResponseEntity.ok(almacenService.listarSupervisoresDisponibles());
    }

    // ── CASCADA ──────────────────────────────────────────────

    @GetMapping("/{idAlmacen}/zonas")
    public ResponseEntity<List<ZonaAlmacenResponseDTO>> listarZonas(@PathVariable Integer idAlmacen) {
        return ResponseEntity.ok(almacenService.listarZonasPorAlmacen(idAlmacen));
    }

    @GetMapping("/zonas/{idZona}/estanterias")
    public ResponseEntity<List<EstanteriaResponseDTO>> listarEstanterias(@PathVariable Integer idZona) {
        return ResponseEntity.ok(almacenService.listarEstanteriasPorZona(idZona));
    }

    @GetMapping("/estanterias/{idEstanteria}/ubicaciones")
    public ResponseEntity<List<UbicacionInternaResponseDTO>> listarUbicaciones(@PathVariable Integer idEstanteria) {
        return ResponseEntity.ok(almacenService.listarUbicacionesPorEstanteria(idEstanteria));
    }

    // ── MÓDULO 2: MÁQUINAS Y TOPOLOGÍA DE ALMACÉN (ÁRBOLES) ──

    @GetMapping("/arbol")
    public ResponseEntity<List<NodoTopologiaDTO>> obtenerArbolTopologia() {
        return ResponseEntity.ok(almacenService.obtenerArbolTopologia());
    }

    @PostMapping("/zonas")
    public ResponseEntity<Map<String, String>> crearZona(@RequestBody Map<String, Object> body) {
        String nombre = (String) body.get("nombre");
        String condicion = (String) body.getOrDefault("condicionClimatica", "Estándar");
        Integer idAlmacen = Integer.parseInt(body.get("idAlmacen").toString());

        almacenService.crearZona(nombre, condicion, idAlmacen);
        return ResponseEntity.ok(Map.of("mensaje", "Zona creada exitosamente"));
    }

    @PostMapping("/estanterias")
    public ResponseEntity<Map<String, String>> crearEstanteria(@RequestBody Map<String, Object> body) {
        String codigo = (String) body.get("codigo");
        Integer idZona = Integer.parseInt(body.get("idZona").toString());

        almacenService.crearEstanteria(codigo, idZona);
        return ResponseEntity.ok(Map.of("mensaje", "Estantería creada exitosamente"));
    }

    @PostMapping("/ubicaciones")
    public ResponseEntity<Map<String, String>> crearUbicacion(@RequestBody Map<String, Object> body) {
        String nivel = body.get("nivel").toString();
        String posicion = body.get("posicion").toString();
        Integer capacidadMaxima = body.containsKey("capacidadMaxima") && body.get("capacidadMaxima") != null
                ? Integer.parseInt(body.get("capacidadMaxima").toString()) : 100;
        Integer idEstanteria = Integer.parseInt(body.get("idEstanteria").toString());

        almacenService.crearUbicacion(nivel, posicion, capacidadMaxima, idEstanteria);
        return ResponseEntity.ok(Map.of("mensaje", "Ubicación creada exitosamente"));
    }

    // ── MÓDULO 2: CÓDIGOS QR & AUDITORÍA MÓVIL ───────────────

    @GetMapping("/ubicaciones/{idUbicacion}/qr")
    public ResponseEntity<Map<String, String>> generarQrUbicacion(@PathVariable Integer idUbicacion) {
        String base64Qr = almacenService.generarQrUbicacionBase64(idUbicacion);
        return ResponseEntity.ok(Map.of("qrBase64", base64Qr));
    }

    @GetMapping("/ubicaciones/qr/{codigoQr}")
    public ResponseEntity<UbicacionDetalleQrDTO> obtenerUbicacionPorQr(@PathVariable String codigoQr) {
        return ResponseEntity.ok(almacenService.obtenerDetalleUbicacionPorQr(codigoQr));
    }

    @PostMapping("/ubicaciones/{idUbicacion}/conteo-fisico")
    public ResponseEntity<UbicacionDetalleQrDTO> registrarConteoFisico(
            @PathVariable Integer idUbicacion,
            @Valid @RequestBody ConteoFisicoRequestDTO request) {
        request.setIdUbicacion(idUbicacion);
        return ResponseEntity.ok(almacenService.registrarConteoFisico(request));
    }
}
