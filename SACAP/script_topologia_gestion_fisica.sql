-- ==============================================================================
-- SCRIPT: MÓDULO 2 — TOPOLOGÍA Y GESTIÓN FÍSICA
-- Actualización de la tabla inventario.ubicacion_interna y estructura
-- Ejecutar en pgAdmin en la base de datos SACPA
-- ==============================================================================

-- 1. Agregar columnas de capacidad y código QR a la tabla ubicacion_interna
ALTER TABLE inventario.ubicacion_interna
  ADD COLUMN IF NOT EXISTS capacidad_maxima INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS capacidad_actual INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS codigo_qr VARCHAR(100);

-- Crear índice único para la búsqueda rápida por código QR
CREATE UNIQUE INDEX IF NOT EXISTS idx_ubicacion_codigo_qr 
  ON inventario.ubicacion_interna(codigo_qr) 
  WHERE codigo_qr IS NOT NULL;

-- 2. Asignar códigos QR automáticos a las ubicaciones existentes que no lo tengan
UPDATE inventario.ubicacion_interna u
SET codigo_qr = 'UBIC-EST' || u.id_estanteria || '-N' || u.nivel || '-P' || u.posicion
WHERE u.codigo_qr IS NULL;

-- 3. Recalcular capacidad_actual sumando las cantidades actuales de los lotes ya asignados
UPDATE inventario.ubicacion_interna u
SET capacidad_actual = COALESCE((
    SELECT SUM(l.cantidad_actual)
    FROM inventario.lotes l
    WHERE l.id_ubicacion = u.id_ubicacion
      AND l.id_estado_lote = 1 -- Estado ACTIVO / DISPONIBLE
), 0);

-- 4. Asegurar que exista el tipo de movimiento INGRESO_A_UBICACION y AJUSTE_AUDITORIA en cat_tipo_movimiento
INSERT INTO catalogos.cat_tipo_movimiento (nombre, naturaleza)
VALUES 
  ('INGRESO_A_UBICACION', 'ENTRADA'),
  ('AJUSTE_AUDITORIA', 'AJUSTE')
ON CONFLICT DO NOTHING;

-- VERIFICACIÓN FINAL
SELECT 
    u.id_ubicacion,
    e.codigo AS estanteria,
    u.nivel,
    u.posicion,
    u.capacidad_maxima,
    u.capacidad_actual,
    u.codigo_qr
FROM inventario.ubicacion_interna u
JOIN inventario.estanteria e ON u.id_estanteria = e.id_estanteria
ORDER BY u.id_ubicacion;
