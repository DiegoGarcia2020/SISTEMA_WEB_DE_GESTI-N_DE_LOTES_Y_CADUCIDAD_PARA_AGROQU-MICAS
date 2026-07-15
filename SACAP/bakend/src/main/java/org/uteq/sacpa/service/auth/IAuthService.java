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

    /**
     * Fase 2: Recibe el token PRE_AUTH (via contexto) y el rol seleccionado.
     * Valida que el usuario posea el rol y emite el token FINAL con dicho rol.
     */
    AuthResponseDTO selectRole(RoleSelectionRequestDTO request, String authHeader);
}
