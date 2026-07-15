package org.uteq.sacpa.service.auth.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.auth.AuthResponseDTO;
import org.uteq.sacpa.dto.auth.LoginRequestDTO;
import org.uteq.sacpa.dto.auth.RoleSelectionRequestDTO;
import org.uteq.sacpa.dto.auth.UsuarioInfoDTO;
import org.uteq.sacpa.security.JwtService;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.auth.IAuthService;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements IAuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        // Autenticar credenciales
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getContrasena())
        );

        // Cargar usuario y roles
        UsuarioPrincipal usuarioPrincipal = (UsuarioPrincipal) userDetailsService.loadUserByUsername(request.getCorreo());

        String jwtToken = jwtService.generatePreAuthToken(
                usuarioPrincipal.getUsername(),
                usuarioPrincipal.getIdUsuario(),
                "",
                "",
                usuarioPrincipal.getCorreo(),
                usuarioPrincipal.getRolesCsv()
        );

        return AuthResponseDTO.builder()
                .token(jwtToken)
                .tipoFase("PRE_AUTH")
                .rolesDisponibles(usuarioPrincipal.getRoles())
                .usuario(new UsuarioInfoDTO(usuarioPrincipal.getIdUsuario(), usuarioPrincipal.getCorreo()))
                .build();
    }

    @Override
    public AuthResponseDTO selectRole(RoleSelectionRequestDTO request, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token invalido");
        }

        String jwt = authHeader.substring(7);
        String correo = jwtService.extractUsername(jwt);
        if (!jwtService.isPreAuthTokenValid(jwt)) {
            throw new RuntimeException("El token proporcionado no es un token de Pre-Autenticacion");
        }

        UsuarioPrincipal usuarioPrincipal = (UsuarioPrincipal) userDetailsService.loadUserByUsername(correo);

        // Validar que el usuario posea el rol seleccionado
        String rolSeleccionado = request.getRolSeleccionado().toUpperCase();
        if (!usuarioPrincipal.getRoles().contains(rolSeleccionado)) {
            throw new RuntimeException("El usuario no posee el rol seleccionado: " + rolSeleccionado);
        }

        String finalJwtToken = jwtService.generateToken(usuarioPrincipal.getUsername(), rolSeleccionado);

        return AuthResponseDTO.builder()
                .token(finalJwtToken)
                .tipoFase("FINAL")
                .rolesDisponibles(null)
                .usuario(new UsuarioInfoDTO(usuarioPrincipal.getIdUsuario(), usuarioPrincipal.getCorreo()))
                .build();
    }
}
