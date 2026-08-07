-- ===========================================================
-- SCRIPT DE MIGRACIÓN: Control de SLA y Recepciones (Dock Scheduling)
-- ===========================================================

ALTER TABLE operaciones.orden_compra
ADD COLUMN IF NOT EXISTS fecha_llegada_estimada DATE,
ADD COLUMN IF NOT EXISTS ventana_horaria VARCHAR(50),
ADD COLUMN IF NOT EXISTS fecha_llegada_real TIMESTAMP,
ADD COLUMN IF NOT EXISTS estado_cumplimiento VARCHAR(20) DEFAULT 'PENDIENTE',
ADD COLUMN IF NOT EXISTS observacion_retraso TEXT;
