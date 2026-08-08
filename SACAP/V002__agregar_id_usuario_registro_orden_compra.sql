-- V002: Agregar columna de trazabilidad del usuario que registra la orden de compra
-- Los registros históricos quedan con NULL (no se pueden inferir retroactivamente de forma segura)

ALTER TABLE operaciones.orden_compra
ADD COLUMN id_usuario_registro INTEGER;

ALTER TABLE operaciones.orden_compra
ADD CONSTRAINT fk_orden_compra_usuario_registro
FOREIGN KEY (id_usuario_registro) REFERENCES seguridad.usuario(id_usuario);

COMMENT ON COLUMN operaciones.orden_compra.id_usuario_registro
IS 'ID del usuario (supervisor) que creó/registró esta orden de compra. NULL para registros históricos pre-V002.';
