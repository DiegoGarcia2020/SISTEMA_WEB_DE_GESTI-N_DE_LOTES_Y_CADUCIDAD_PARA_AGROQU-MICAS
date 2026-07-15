-- ==============================================================================
-- SCRIPT DE ACTUALIZACIÓN DE BASE DE DE DATOS SACPA - MÓDULO ADMINISTRADOR
-- ==============================================================================

-- 1. AGREGAR CAMPO FOTO DE PERFIL A LA TABLA ADMINISTRADOR
ALTER TABLE IF EXISTS gerencia.administrador
ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

-- 2. INSERTAR ROLES DE BASE DE DATOS (seguridad.rol_bd)
INSERT INTO seguridad.rol_bd (nombre_rol_bd, descripcion, activo)
VALUES 
    ('rol_admin_sacpa', 'Rol de PostgreSQL con acceso total a todos los esquemas SACPA', TRUE),
    ('rol_supervisor_sacpa', 'Rol de PostgreSQL para supervisión de campo y bodegas', TRUE),
    ('rol_bodeguero_sacpa', 'Rol de PostgreSQL limitado a inventario y almacén', TRUE),
    ('rol_tecnico_sacpa', 'Rol de PostgreSQL para técnicos de campo', TRUE),
    ('rol_proveedor_sacpa', 'Rol de PostgreSQL para portal de proveedores externalizados', TRUE),
    ('rol_gerente_sacpa', 'Rol de PostgreSQL de lectura para reportes ejecutivos', TRUE)
ON CONFLICT (nombre_rol_bd) DO NOTHING;

-- 3. INSERTAR TIPOS DE OBJETO DE SEGURIDAD (seguridad.tipo_objeto_seguridad)
INSERT INTO seguridad.tipo_objeto_seguridad (nombre, descripcion, activo)
VALUES 
    ('TABLA', 'Tablas relacionales en los esquemas de PostgreSQL', TRUE),
    ('VISTA', 'Vistas de base de datos para reportes y lectura', TRUE),
    ('FUNCION', 'Funciones y procedimientos almacenados en la BD', TRUE),
    ('ENDPOINT_API', 'Endpoint REST del servidor Backend Spring Boot', TRUE),
    ('MODULO_UI', 'Módulo o pantalla del frontend Angular', TRUE)
ON CONFLICT DO NOTHING;

-- 4. INSERTAR ROLES DEL SISTEMA (seguridad.rol)
INSERT INTO seguridad.rol (nombre, id_estado, id_rol_bd)
SELECT 'Administrador', 1, id_rol_bd FROM seguridad.rol_bd WHERE nombre_rol_bd = 'rol_admin_sacpa'
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO seguridad.rol (nombre, id_estado, id_rol_bd)
SELECT 'Supervisor', 1, id_rol_bd FROM seguridad.rol_bd WHERE nombre_rol_bd = 'rol_supervisor_sacpa'
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO seguridad.rol (nombre, id_estado, id_rol_bd)
SELECT 'Bodeguero', 1, id_rol_bd FROM seguridad.rol_bd WHERE nombre_rol_bd = 'rol_bodeguero_sacpa'
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO seguridad.rol (nombre, id_estado, id_rol_bd)
SELECT 'Técnico de Campo', 1, id_rol_bd FROM seguridad.rol_bd WHERE nombre_rol_bd = 'rol_tecnico_sacpa'
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO seguridad.rol (nombre, id_estado, id_rol_bd)
SELECT 'Proveedor', 1, id_rol_bd FROM seguridad.rol_bd WHERE nombre_rol_bd = 'rol_proveedor_sacpa'
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO seguridad.rol (nombre, id_estado, id_rol_bd)
SELECT 'Gerente', 1, id_rol_bd FROM seguridad.rol_bd WHERE nombre_rol_bd = 'rol_gerente_sacpa'
ON CONFLICT (nombre) DO NOTHING;

-- 5. INSERTAR PRIVILEGIOS BASE (seguridad.privilegio)
INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto)
SELECT 'Gestión de Usuarios', 'ALL', TRUE, id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto)
SELECT 'Gestión de Roles y Permisos', 'ALL', TRUE, id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto)
SELECT 'Gestión de Temporadas Agrícolas', 'ALL', TRUE, id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto)
SELECT 'Aprobación de Sugerencias IA y Promociones', 'ALL', TRUE, id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto)
SELECT 'Control de Inventario y Bodegas', 'SELECT, INSERT, UPDATE', TRUE, id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1
ON CONFLICT DO NOTHING;

-- 6. INSERTAR REGLA DE NEGOCIO IA BASE (ia_alertas.regla_negocio_ia)
INSERT INTO ia_alertas.regla_negocio_ia (descuento_maximo, activar_promociones, activo)
VALUES (35.00, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- 7. INSERTAR MODELO IA BASE (ia_alertas.modelo_ia)
INSERT INTO ia_alertas.modelo_ia (nombre_modelo, version, descripcion, activo)
VALUES ('AgroSense Predictor de Caducidad', 'v2.4-PROD', 'Modelo de IA para estimar fechas de caducidad y sugerir descuentos automáticos en lotes.', TRUE)
ON CONFLICT DO NOTHING;

-- 8. AGREGAR COLUMNAS ESQUEMA Y NOMBRE_TABLA A LA TABLA PRIVILEGIO (VISTA JERÁRQUICA)
ALTER TABLE IF EXISTS seguridad.privilegio
ADD COLUMN IF NOT EXISTS esquema VARCHAR(100),
ADD COLUMN IF NOT EXISTS nombre_tabla VARCHAR(100);

UPDATE seguridad.privilegio SET esquema = 'seguridad', nombre_tabla = 'usuario' WHERE nombre ILIKE '%Usuarios%';
UPDATE seguridad.privilegio SET esquema = 'seguridad', nombre_tabla = 'rol' WHERE nombre ILIKE '%Roles%' OR nombre ILIKE '%Permisos%';
UPDATE seguridad.privilegio SET esquema = 'campo', nombre_tabla = 'temporada' WHERE nombre ILIKE '%Temporadas%';
UPDATE seguridad.privilegio SET esquema = 'ia_alertas', nombre_tabla = 'promocion' WHERE nombre ILIKE '%Sugerencias IA%' OR nombre ILIKE '%Promociones%';
UPDATE seguridad.privilegio SET esquema = 'inventario', nombre_tabla = 'bodega' WHERE nombre ILIKE '%Inventario%' OR nombre ILIKE '%Bodegas%';
UPDATE seguridad.privilegio SET esquema = 'general', nombre_tabla = 'sistema' WHERE esquema IS NULL OR nombre_tabla IS NULL;

-- VERIFICACIÓN FINAL
SELECT 'Actualizaciones de base de datos ejecutadas correctamente.' AS resultado;
