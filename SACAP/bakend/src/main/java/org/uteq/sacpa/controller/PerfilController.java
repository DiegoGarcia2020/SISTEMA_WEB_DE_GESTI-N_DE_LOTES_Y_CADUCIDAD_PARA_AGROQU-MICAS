package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.auth.CambioContrasenaRequestDTO;
import org.uteq.sacpa.dto.seguridad.ActualizarPerfilRequestDTO;
import org.uteq.sacpa.dto.seguridad.MiPerfilResponseDTO;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.seguridad.IPerfilService;

import java.util.Map;

/**
 * Perfil propio del usuario autenticado -- disponible para CUALQUIER rol
 * (Administrador, Supervisor, Bodeguero, Tecnico de Campo), a diferencia de
 * /api/administrador/**, que solo servia al rol Administrador.
 * El id de usuario siempre se resuelve del JWT, nunca de la URL o el body,
 * para que nadie pueda leer o modificar el perfil de otra persona.
 */
@RestController
@RequestMapping("/api/perfil")
@RequiredArgsConstructor
public class PerfilController {

    private final IPerfilService perfilService;

    @GetMapping
    public ResponseEntity<MiPerfilResponseDTO> obtenerMiPerfil() {
        return ResponseEntity.ok(perfilService.obtenerMiPerfil(idUsuarioAutenticado()));
    }

    @PutMapping
    public ResponseEntity<MiPerfilResponseDTO> actualizarMiPerfil(@RequestBody ActualizarPerfilRequestDTO datos) {
        return ResponseEntity.ok(perfilService.actualizarMiPerfil(idUsuarioAutenticado(), datos));
    }

    @PatchMapping("/foto")
    public ResponseEntity<MiPerfilResponseDTO> actualizarMiFoto(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(perfilService.actualizarMiFoto(idUsuarioAutenticado(), body.get("fotoPerfil")));
    }

    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<Void> cambiarMiContrasena(@Valid @RequestBody CambioContrasenaRequestDTO request) {
        perfilService.cambiarMiContrasena(idUsuarioAutenticado(), request);
        return ResponseEntity.noContent().build();
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
