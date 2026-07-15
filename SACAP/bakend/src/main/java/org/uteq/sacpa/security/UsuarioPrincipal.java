package org.uteq.sacpa.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.entity.seguridad.UsuarioRol;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementacion de UserDetails para el sistema SACPA.
 * Envuelve la entidad Usuario y expone sus roles como GrantedAuthority.
 */
@Getter
public class UsuarioPrincipal implements UserDetails {

    private final Usuario usuario;
    private final List<String> nombreRoles;

    public UsuarioPrincipal(Usuario usuario) {
        this.usuario = usuario;
        this.nombreRoles = usuario.getRoles() == null ? List.of() :
            usuario.getRoles().stream()
                .map(ur -> ur.getRol().getNombre().toUpperCase())
                .collect(Collectors.toList());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return nombreRoles.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return usuario.getContrasena();
    }

    @Override
    public String getUsername() {
        return usuario.getCorreo();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        // Estado 1 = Activo en cat_estado_general
        return usuario.getIdEstado() != null && usuario.getIdEstado() == 1;
    }

    public Integer getIdUsuario() { return usuario.getIdUsuario(); }

    public String getCorreo() { return usuario.getCorreo(); }

    public List<String> getRoles() { return nombreRoles; }

    public String getRolesCsv() { return String.join(",", nombreRoles); }
}