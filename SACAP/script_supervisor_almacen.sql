-- ============================================================
-- Script: Migración Módulo 2 - Supervisor asignado a Almacén
-- ============================================================
-- 1. Agregar columnas a inventario.almacen
ALTER TABLE inventario.almacen
    ADD COLUMN IF NOT EXISTS id_supervisor INTEGER REFERENCES inventario.supervisor(id_supervisor),
    ADD COLUMN IF NOT EXISTS direccion VARCHAR(300);

-- 1b. Lote "flotante" (creado por el Supervisor, aún sin ubicación física asignada
--     por el Bodeguero) necesita saber a qué bodega pertenece.
ALTER TABLE inventario.lotes
    ADD COLUMN IF NOT EXISTS id_almacen INTEGER REFERENCES inventario.almacen(id_almacen);

-- 2. Asignar el supervisor existente a la(s) bodega(s) de prueba
--    (Ajustar id_supervisor e id_almacen según tu base de datos real)
-- UPDATE inventario.almacen SET id_supervisor = 1 WHERE id_almacen = 1;

-- 3. Verificar la estructura de categorías existentes
SELECT id_categoria, nombre, id_estado
FROM inventario.categoria
ORDER BY id_categoria;

-- 4. Insertar categorías agroquímicas adicionales si no existen
INSERT INTO inventario.categoria (nombre, id_estado)
SELECT nombre, 1
FROM (VALUES
    ('Fungicidas'),
    ('Herbicidas'),
    ('Insecticidas'),
    ('Fertilizantes (Urea)'),
    ('Fertilizantes (NPK)'),
    ('Control de Malezas'),
    ('Nematicidas'),
    ('Reguladores de Crecimiento'),
    ('Coadyuvantes')
) AS nuevas(nombre)
WHERE NOT EXISTS (
    SELECT 1 FROM inventario.categoria c WHERE c.nombre = nuevas.nombre
);

-- 5. Consulta de verificación
SELECT
    a.id_almacen,
    a.nombre AS bodega,
    a.direccion,
    s.nombres || ' ' || s.apellidos AS supervisor,
    s.area_supervision,
    c2.nombre AS ciudad
FROM inventario.almacen a
LEFT JOIN inventario.supervisor s ON a.id_supervisor = s.id_supervisor
LEFT JOIN catalogos.cat_ciudad c2 ON a.id_ciudad = c2.id_ciudad
ORDER BY a.id_almacen;
