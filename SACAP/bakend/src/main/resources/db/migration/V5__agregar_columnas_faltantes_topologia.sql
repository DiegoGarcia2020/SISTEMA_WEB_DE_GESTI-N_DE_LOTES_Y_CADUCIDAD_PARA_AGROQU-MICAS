-- La entidad Almacen (entity/inventario/Almacen.java) usa el campo "direccion"
-- (formulario "Nueva Bodega" del Administrador) pero la columna nunca se creó.
ALTER TABLE inventario.almacen
ADD COLUMN IF NOT EXISTS direccion VARCHAR(300);

-- La entidad UbicacionInterna (entity/inventario/UbicacionInterna.java) usa
-- capacidad_maxima/capacidad_actual (Topología de Bodega) y codigo_qr
-- (Auditoría QR) pero las columnas nunca se crearon.
ALTER TABLE inventario.ubicacion_interna
ADD COLUMN IF NOT EXISTS capacidad_maxima INTEGER,
ADD COLUMN IF NOT EXISTS capacidad_actual INTEGER,
ADD COLUMN IF NOT EXISTS codigo_qr VARCHAR(100);
