package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.entity.gerencia.Administrador;
import org.uteq.sacpa.service.gerencia.IAdministradorService;

import java.util.Map;

@RestController
@RequestMapping("/api/administrador")
@RequiredArgsConstructor
public class AdministradorController {

    private final IAdministradorService administradorService;

    @GetMapping("/perfil/{idUsuario}")
    public ResponseEntity<Administrador> obtenerPerfil(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(administradorService.obtenerPorIdUsuario(idUsuario));
    }

    @PutMapping("/perfil/{idUsuario}")
    public ResponseEntity<Administrador> actualizarPerfil(@PathVariable Integer idUsuario, @RequestBody Map<String, Object> datos) {
        return ResponseEntity.ok(administradorService.actualizarPerfil(idUsuario, datos));
    }

    @PatchMapping("/perfil/{idUsuario}/foto")
    public ResponseEntity<Void> actualizarFoto(@PathVariable Integer idUsuario, @RequestBody Map<String, String> body) {
        String foto = body.get("fotoPerfil");
        administradorService.actualizarFotoPerfil(idUsuario, foto);
        return ResponseEntity.noContent().build();
    }
}
