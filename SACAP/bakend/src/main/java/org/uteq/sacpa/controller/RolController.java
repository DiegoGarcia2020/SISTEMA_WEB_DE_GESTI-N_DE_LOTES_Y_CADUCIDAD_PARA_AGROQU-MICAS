package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.entity.seguridad.Rol;
import org.uteq.sacpa.entity.seguridad.RolBD;
import org.uteq.sacpa.service.seguridad.IRolService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolController {

    private final IRolService rolService;

    // --- ROLES DEL SISTEMA ---
    @GetMapping
    public ResponseEntity<List<Rol>> listarRoles() {
        return ResponseEntity.ok(rolService.listarRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(rolService.obtenerRolPorId(id));
    }

    @PostMapping
    public ResponseEntity<Rol> crearRol(@RequestBody Map<String, Object> datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rolService.crearRol(datos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rol> actualizarRol(@PathVariable Integer id, @RequestBody Map<String, Object> datos) {
        return ResponseEntity.ok(rolService.actualizarRol(id, datos));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> cambiarEstadoRol(@PathVariable Integer id, @RequestBody Map<String, Object> datos) {
        Integer idEstado = datos.get("idEstado") != null ? ((Number) datos.get("idEstado")).intValue() : 1;
        rolService.cambiarEstadoRol(id, idEstado);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Integer id) {
        rolService.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }

    // --- ROLES DE BASE DE DATOS (RolBD) ---
    @GetMapping("/bd")
    public ResponseEntity<List<RolBD>> listarRolesBd() {
        return ResponseEntity.ok(rolService.listarRolesBd());
    }

    @PostMapping("/bd")
    public ResponseEntity<RolBD> crearRolBd(@RequestBody Map<String, Object> datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rolService.crearRolBd(datos));
    }

    @PutMapping("/bd/{id}")
    public ResponseEntity<RolBD> actualizarRolBd(@PathVariable Integer id, @RequestBody Map<String, Object> datos) {
        return ResponseEntity.ok(rolService.actualizarRolBd(id, datos));
    }

    @PatchMapping("/bd/{id}/estado")
    public ResponseEntity<Void> cambiarEstadoRolBd(@PathVariable Integer id, @RequestBody Map<String, Object> datos) {
        Boolean activo = datos.get("activo") != null ? (Boolean) datos.get("activo") : true;
        rolService.cambiarEstadoRolBd(id, activo);
        return ResponseEntity.noContent().build();
    }
}
