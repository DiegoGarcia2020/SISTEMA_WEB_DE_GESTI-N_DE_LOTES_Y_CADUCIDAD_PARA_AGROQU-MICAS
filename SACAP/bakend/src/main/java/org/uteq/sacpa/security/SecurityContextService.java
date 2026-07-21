package org.uteq.sacpa.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.exception.AccesoDenegadoException;

@Service
@RequiredArgsConstructor
public class SecurityContextService {

    public UsuarioPrincipal obtenerPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UsuarioPrincipal principal)) {
            throw new AccesoDenegadoException("No hay sesión autenticada.");
        }
        return principal;
    }

    public Integer obtenerIdUsuario() {
        return obtenerPrincipal().getIdUsuario();
    }

    public String obtenerNombreUsuario() {
        return obtenerPrincipal().getUsername();
    }
}