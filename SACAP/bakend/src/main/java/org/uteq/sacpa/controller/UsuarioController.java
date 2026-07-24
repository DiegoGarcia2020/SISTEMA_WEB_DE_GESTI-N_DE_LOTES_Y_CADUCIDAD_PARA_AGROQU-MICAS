package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.seguridad.CambioEstadoRequestDTO;
import org.uteq.sacpa.dto.seguridad.UsuarioRequestDTO;
import org.uteq.sacpa.dto.seguridad.UsuarioResponseDTO;
import org.uteq.sacpa.service.seguridad.IUsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final IUsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crear(@Valid @RequestBody UsuarioRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crear(request));
    }

    @PostMapping("/basico")
    public ResponseEntity<UsuarioResponseDTO> crearBasico(@Valid @RequestBody org.uteq.sacpa.dto.seguridad.CrearUsuarioBasicoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearBasico(request));
    }

    @PostMapping(value = "/{id}/asignar-rol", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioResponseDTO> asignarRol(
            @PathVariable Integer id,
            @RequestParam("idRol") Integer idRol,
            @RequestParam(value = "documento", required = false) org.springframework.web.multipart.MultipartFile documento) {
        return ResponseEntity.ok(usuarioService.asignarRol(id, idRol, documento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody UsuarioRequestDTO request) {
        return ResponseEntity.ok(usuarioService.actualizar(id, request));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> cambiarEstado(@PathVariable Integer id, @Valid @RequestBody CambioEstadoRequestDTO request) {
        usuarioService.cambiarEstado(id, request.getIdEstado());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<UsuarioResponseDTO> resetPassword(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.resetPassword(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

