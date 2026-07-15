-- ==============================================================================
-- SCRIPT PARA IMPLEMENTAR PERMISOS JERÁRQUICOS POR ESQUEMA Y TABLA EN SACPA
-- ==============================================================================

-- 1. AGREGAR COLUMNAS ESQUEMA Y NOMBRE_TABLA A LA TABLA PRIVILEGIO
ALTER TABLE IF EXISTS seguridad.privilegio
ADD COLUMN IF NOT EXISTS esquema VARCHAR(100),
ADD COLUMN IF NOT EXISTS nombre_tabla VARCHAR(100);

-- 2. ACTUALIZAR LOS PRIVILEGIOS EXISTENTES (CLASIFICACIÓN INICIAL)
UPDATE seguridad.privilegio SET esquema = 'seguridad', nombre_tabla = 'usuario' WHERE nombre ILIKE '%Usuarios%';
UPDATE seguridad.privilegio SET esquema = 'seguridad', nombre_tabla = 'rol' WHERE nombre ILIKE '%Roles%' OR nombre ILIKE '%Permisos%';
UPDATE seguridad.privilegio SET esquema = 'campo', nombre_tabla = 'temporada' WHERE nombre ILIKE '%Temporadas%';
UPDATE seguridad.privilegio SET esquema = 'ia_alertas', nombre_tabla = 'promocion' WHERE nombre ILIKE '%Sugerencias IA%' OR nombre ILIKE '%Promociones%';
UPDATE seguridad.privilegio SET esquema = 'inventario', nombre_tabla = 'bodega' WHERE nombre ILIKE '%Inventario%' OR nombre ILIKE '%Bodegas%';

-- 3. SI QUEDAN PRIVILEGIOS SIN CLASIFICAR, ASIGNARLES VALOR POR DEFECTO
UPDATE seguridad.privilegio SET esquema = 'general', nombre_tabla = 'sistema' WHERE esquema IS NULL OR nombre_tabla IS NULL;

-- 4. AGREGAR ALGUNOS PERMISOS GRANULARES DE EJEMPLO PARA MOSTRAR EN LA INTERFAZ
INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto, esquema, nombre_tabla)
SELECT 'Lectura de Productos', 'SELECT', TRUE, (SELECT id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1), 'inventario', 'producto'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.privilegio WHERE esquema = 'inventario' AND nombre_tabla = 'producto' AND accion = 'SELECT');

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto, esquema, nombre_tabla)
SELECT 'Creación de Productos', 'INSERT', TRUE, (SELECT id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1), 'inventario', 'producto'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.privilegio WHERE esquema = 'inventario' AND nombre_tabla = 'producto' AND accion = 'INSERT');

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto, esquema, nombre_tabla)
SELECT 'Edición de Productos', 'UPDATE', TRUE, (SELECT id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1), 'inventario', 'producto'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.privilegio WHERE esquema = 'inventario' AND nombre_tabla = 'producto' AND accion = 'UPDATE');

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto, esquema, nombre_tabla)
SELECT 'Eliminación de Productos', 'DELETE', TRUE, (SELECT id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1), 'inventario', 'producto'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.privilegio WHERE esquema = 'inventario' AND nombre_tabla = 'producto' AND accion = 'DELETE');

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto, esquema, nombre_tabla)
SELECT 'Lectura de Catálogos de Estado', 'SELECT', TRUE, (SELECT id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1), 'catalogos', 'cat_estado_general'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.privilegio WHERE esquema = 'catalogos' AND nombre_tabla = 'cat_estado_general' AND accion = 'SELECT');

INSERT INTO seguridad.privilegio (nombre, accion, activo, id_tipo_objeto, esquema, nombre_tabla)
SELECT 'Lectura de Auditorías', 'SELECT', TRUE, (SELECT id_tipo_objeto FROM seguridad.tipo_objeto_seguridad WHERE nombre = 'TABLA' LIMIT 1), 'seguridad', 'auditoria'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.privilegio WHERE esquema = 'seguridad' AND nombre_tabla = 'auditoria' AND accion = 'SELECT');

-- VERIFICACIÓN
SELECT * FROM seguridad.privilegio ORDER BY esquema, nombre_tabla, id_privilegio;
