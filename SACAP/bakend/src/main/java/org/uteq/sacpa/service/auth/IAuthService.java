package org.uteq.sacpa.service.auth;

import org.uteq.sacpa.dto.auth.AuthResponseDTO;
import org.uteq.sacpa.dto.auth.LoginRequestDTO;
import org.uteq.sacpa.dto.auth.RoleSelectionRequestDTO;

public interface IAuthService {
    /**
     * Fase 1: Valida credenciales y emite un token PRE_AUTH.
     * Retorna los roles disponibles para el usuario.
     */
    AuthResponseDTO login(LoginRequestDTO request);

    AuthResponseDTO selectRole(RoleSelectionRequestDTO request, String authHeader);

    /**
     * Permite al usuario autenticado (con token PRE_AUTH o FINAL) actualizar su contraseña personal
     * y limpiar la bandera requiereCambioClave.
     */
    void cambiarContrasena(org.uteq.sacpa.dto.auth.CambioContrasenaRequestDTO request, String authHeader);
}


