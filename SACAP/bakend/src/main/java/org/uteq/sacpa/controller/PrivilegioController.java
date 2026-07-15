package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.seguridad.EsquemaPrivilegiosDTO;
import org.uteq.sacpa.entity.seguridad.Privilegio;
import org.uteq.sacpa.entity.seguridad.RolPrivilegio;
import org.uteq.sacpa.entity.seguridad.TipoObjetoSeguridad;
import org.uteq.sacpa.service.seguridad.IPrivilegioService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/privilegios")
@RequiredArgsConstructor
public class PrivilegioController {

    private final IPrivilegioService privilegioService;

    // --- PRIVILEGIOS ---
    @GetMapping
    public ResponseEntity<List<Privilegio>> listarPrivilegios() {
        return ResponseEntity.ok(privilegioService.listarPrivilegios());
    }

    @GetMapping("/agrupados")
    public ResponseEntity<List<EsquemaPrivilegiosDTO>> listarPrivilegiosAgrupados() {
        return ResponseEntity.ok(privilegioService.listarPrivilegiosAgrupados());
    }

    @PostMapping
    public ResponseEntity<Privilegio> crearPrivilegio(@RequestBody Map<String, Object> datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(privilegioService.crearPrivilegio(datos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Privilegio> actualizarPrivilegio(@PathVariable Integer id, @RequestBody Map<String, Object> datos) {
        return ResponseEntity.ok(privilegioService.actualizarPrivilegio(id, datos));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivarPrivilegio(@PathVariable Integer id) {
        privilegioService.desactivarPrivilegio(id);
        return ResponseEntity.noContent().build();
    }

    // --- TIPOS DE OBJETO DE SEGURIDAD ---
    @GetMapping("/tipos-objeto")
    public ResponseEntity<List<TipoObjetoSeguridad>> listarTiposObjeto() {
        return ResponseEntity.ok(privilegioService.listarTiposObjeto());
    }

    @PostMapping("/tipos-objeto")
    public ResponseEntity<TipoObjetoSeguridad> crearTipoObjeto(@RequestBody Map<String, Object> datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(privilegioService.crearTipoObjeto(datos));
    }

    // --- ASIGNACIÓN ROL <-> PRIVILEGIOS ---
    @GetMapping("/rol/{idRol}")
    public ResponseEntity<List<RolPrivilegio>> listarPrivilegiosPorRol(@PathVariable Integer idRol) {
        return ResponseEntity.ok(privilegioService.listarPrivilegiosPorRol(idRol));
    }

    @PostMapping("/rol/{idRol}")
    public ResponseEntity<Void> asignarPrivilegiosARol(@PathVariable Integer idRol, @RequestBody Map<String, List<Integer>> body) {
        List<Integer> idPrivilegios = body.get("idPrivilegios");
        privilegioService.asignarPrivilegiosARol(idRol, idPrivilegios != null ? idPrivilegios : List.of());
        return ResponseEntity.noContent().build();
    }
}
