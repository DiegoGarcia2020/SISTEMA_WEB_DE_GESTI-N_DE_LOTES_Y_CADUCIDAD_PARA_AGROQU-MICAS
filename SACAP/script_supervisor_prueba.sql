-- ============================================================
-- Script: Supervisor de prueba (Juan Pérez)
-- Crea la cuenta (seguridad.usuario), el perfil (inventario.supervisor)
-- y le asigna el rol SUPERVISOR.
-- ============================================================

-- 1. Crear usuario + perfil de supervisor
--    Contraseña: Supervisor123!  (ya viene hasheada con BCrypt)
SELECT inventario.fn_crear_supervisor(
    'juan.perez@agrosense.ec',                                     -- correo
    '$2a$10$14jV4VaHwRuYKoqP/JaIHOOjmUYRtJh4MCJQMrwqvv9lWmMCQAVHy', -- contraseña: Supervisor123!
    1,                                                              -- id_estado (1 = Activo)
    '1712345678',                                                   -- cedula
    'Juan',                                                         -- nombres
    'Pérez',                                                        -- apellidos
    '0991234567',                                                   -- telefono
    'Bodega Central'                                                -- area_supervision
);

-- 2. Asignarle el rol SUPERVISOR (id_rol = 3, ver seguridad.rol)
INSERT INTO seguridad.usuario_rol (id_usuario, id_rol)
SELECT id_usuario, 3
FROM seguridad.usuario
WHERE correo = 'juan.perez@agrosense.ec';

-- 3. Verificación
SELECT u.id_usuario, u.correo, s.id_supervisor, s.nombres, s.apellidos, r.nombre AS rol
FROM seguridad.usuario u
JOIN inventario.supervisor s ON s.id_usuario = u.id_usuario
JOIN seguridad.usuario_rol ur ON ur.id_usuario = u.id_usuario
JOIN seguridad.rol r ON r.id_rol = ur.id_rol
WHERE u.correo = 'juan.perez@agrosense.ec';
