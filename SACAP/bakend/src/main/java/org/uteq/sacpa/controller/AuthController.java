package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.auth.AuthResponseDTO;
import org.uteq.sacpa.dto.auth.LoginRequestDTO;
import org.uteq.sacpa.dto.auth.RoleSelectionRequestDTO;
import org.uteq.sacpa.service.auth.IAuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private IAuthService authService;

    /**
     * Paso 1: Autenticar credenciales y obtener token PRE_AUTH con roles disponibles.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Paso 2: Seleccionar rol y obtener token FINAL.
     * Se debe enviar el token PRE_AUTH en la cabecera Authorization.
     */
    @PostMapping("/select-role")
    public ResponseEntity<AuthResponseDTO> selectRole(
            @Valid @RequestBody RoleSelectionRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(authService.selectRole(request, authHeader));
    }
}
