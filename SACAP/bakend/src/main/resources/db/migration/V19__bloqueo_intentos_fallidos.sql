-- Auditoria de seguridad: SecurityConfig.authenticationProvider() comparaba la contrasena
-- pero no llevaba ningun conteo de intentos fallidos -- un atacante podia probar
-- contrasenas indefinidamente contra cualquier cuenta (fuerza bruta / credential stuffing)
-- sin ninguna friccion. UsuarioPrincipal.isAccountNonLocked() ya existia como hook de
-- Spring Security pero estaba hardcodeado a "true", sin nada que lo alimentara.

ALTER TABLE seguridad.usuario
    ADD COLUMN intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN bloqueado_hasta TIMESTAMP;

COMMENT ON COLUMN seguridad.usuario.intentos_fallidos IS
    'Intentos de login fallidos consecutivos. Se reinicia a 0 en un login exitoso.';
COMMENT ON COLUMN seguridad.usuario.bloqueado_hasta IS
    'Cuenta bloqueada temporalmente hasta esta fecha/hora tras superar el maximo de intentos fallidos (ver SecurityConfig).';
