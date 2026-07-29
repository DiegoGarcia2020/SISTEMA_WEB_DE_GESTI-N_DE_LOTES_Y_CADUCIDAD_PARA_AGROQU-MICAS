-- ============================================================
-- Script: Módulo 3 — Ventas y Motor IA
-- Idempotente: seguro de correr más de una vez.
-- ============================================================

-- ── 1. Catálogos nuevos ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS catalogos.cat_estado_temporada (
    id_estado_temporada SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true
);
INSERT INTO catalogos.cat_estado_temporada (id_estado_temporada, nombre)
SELECT * FROM (VALUES (1, 'ACTIVA'), (2, 'CERRADA'), (3, 'PLANIFICADA')) AS v(id, nombre)
WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_estado_temporada WHERE id_estado_temporada = v.id);
SELECT setval(pg_get_serial_sequence('catalogos.cat_estado_temporada', 'id_estado_temporada'),
              GREATEST((SELECT MAX(id_estado_temporada) FROM catalogos.cat_estado_temporada), 1));

CREATE TABLE IF NOT EXISTS catalogos.cat_estado_alerta (
    id_estado_alerta SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true
);
INSERT INTO catalogos.cat_estado_alerta (id_estado_alerta, nombre)
SELECT * FROM (VALUES (1, 'ACTIVA'), (2, 'DESCARTADA'), (3, 'EN_PROMOCION')) AS v(id, nombre)
WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_estado_alerta WHERE id_estado_alerta = v.id);
SELECT setval(pg_get_serial_sequence('catalogos.cat_estado_alerta', 'id_estado_alerta'),
              GREATEST((SELECT MAX(id_estado_alerta) FROM catalogos.cat_estado_alerta), 1));

CREATE TABLE IF NOT EXISTS catalogos.cat_estado_promocion (
    id_estado_promocion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true
);
INSERT INTO catalogos.cat_estado_promocion (id_estado_promocion, nombre)
SELECT * FROM (VALUES (1, 'SUGERIDA'), (2, 'APROBADA'), (3, 'RECHAZADA'), (4, 'ACTIVA'), (5, 'INACTIVA')) AS v(id, nombre)
WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_estado_promocion WHERE id_estado_promocion = v.id);
SELECT setval(pg_get_serial_sequence('catalogos.cat_estado_promocion', 'id_estado_promocion'),
              GREATEST((SELECT MAX(id_estado_promocion) FROM catalogos.cat_estado_promocion), 1));

CREATE TABLE IF NOT EXISTS catalogos.cat_estado_venta (
    id_estado_venta SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true
);
INSERT INTO catalogos.cat_estado_venta (id_estado_venta, nombre)
SELECT * FROM (VALUES (1, 'PENDIENTE_DESPACHO'), (2, 'DESPACHADA'), (3, 'ANULADA')) AS v(id, nombre)
WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_estado_venta WHERE id_estado_venta = v.id);
SELECT setval(pg_get_serial_sequence('catalogos.cat_estado_venta', 'id_estado_venta'),
              GREATEST((SELECT MAX(id_estado_venta) FROM catalogos.cat_estado_venta), 1));

-- ── 2. Retrofit de FK sobre columnas id_estado ya existentes ─
-- (verificado: la única fila real en temporadas_agricolas/alertas_caducidad usa id_estado=1,
--  promociones está vacía — compatible con los catálogos de arriba sin migrar datos)

DO $$ BEGIN
    ALTER TABLE ia_alertas.temporadas_agricolas
        ADD CONSTRAINT fk_temporada_estado FOREIGN KEY (id_estado)
        REFERENCES catalogos.cat_estado_temporada(id_estado_temporada);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE ia_alertas.alertas_caducidad
        ADD CONSTRAINT fk_alerta_estado FOREIGN KEY (id_estado)
        REFERENCES catalogos.cat_estado_alerta(id_estado_alerta);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE ia_alertas.promociones
        ADD CONSTRAINT fk_promocion_estado FOREIGN KEY (id_estado)
        REFERENCES catalogos.cat_estado_promocion(id_estado_promocion);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. Columnas nuevas ────────────────────────────────────────

ALTER TABLE inventario.lotes
    ADD COLUMN IF NOT EXISTS cantidad_reservada INTEGER NOT NULL DEFAULT 0;

ALTER TABLE ia_alertas.regla_negocio_ia
    ADD COLUMN IF NOT EXISTS dias_alerta_anticipada INTEGER DEFAULT 60;

-- ── 4. Tablas nuevas: Cliente, Venta, DetalleVenta ───────────

CREATE TABLE IF NOT EXISTS entidades.cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    cedula_ruc VARCHAR(20),
    telefono VARCHAR(30),
    ubicacion_finca TEXT,
    id_estado INTEGER REFERENCES catalogos.cat_estado_general(id_estado)
);

CREATE TABLE IF NOT EXISTS operaciones.venta (
    id_venta SERIAL PRIMARY KEY,
    numero_orden VARCHAR(30) UNIQUE NOT NULL,
    fecha_venta TIMESTAMP,
    id_cliente INTEGER REFERENCES entidades.cliente(id_cliente),
    id_tecnico INTEGER REFERENCES operaciones.tecnico_campo(id_tecnico),
    subtotal NUMERIC(10,2),
    descuento_total NUMERIC(10,2),
    total NUMERIC(10,2),
    id_estado INTEGER REFERENCES catalogos.cat_estado_venta(id_estado_venta)
);

CREATE TABLE IF NOT EXISTS operaciones.detalle_venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INTEGER REFERENCES operaciones.venta(id_venta),
    id_lote INTEGER REFERENCES inventario.lotes(id_lote),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2),
    subtotal_linea NUMERIC(10,2),
    es_combo_ia BOOLEAN DEFAULT false,
    id_promocion INTEGER REFERENCES ia_alertas.promociones(id_promocion)
);

-- ── 5. Funciones PL/pgSQL nuevas ──────────────────────────────

CREATE OR REPLACE FUNCTION entidades.fn_crear_cliente(
    p_nombre VARCHAR, p_cedula_ruc VARCHAR, p_telefono VARCHAR,
    p_ubicacion_finca TEXT, p_id_estado INTEGER
) RETURNS void LANGUAGE plpgsql AS $function$
BEGIN
    INSERT INTO entidades.cliente (nombre, cedula_ruc, telefono, ubicacion_finca, id_estado)
    VALUES (p_nombre, p_cedula_ruc, p_telefono, p_ubicacion_finca, p_id_estado);
END;
$function$;

CREATE OR REPLACE FUNCTION entidades.fn_actualizar_cliente(
    p_id_cliente INTEGER, p_nombre VARCHAR, p_cedula_ruc VARCHAR,
    p_telefono VARCHAR, p_ubicacion_finca TEXT, p_id_estado INTEGER
) RETURNS void LANGUAGE plpgsql AS $function$
BEGIN
    UPDATE entidades.cliente
    SET nombre = p_nombre, cedula_ruc = p_cedula_ruc, telefono = p_telefono,
        ubicacion_finca = p_ubicacion_finca, id_estado = p_id_estado
    WHERE id_cliente = p_id_cliente;
END;
$function$;

CREATE OR REPLACE FUNCTION entidades.fn_desactivar_cliente(
    p_id_cliente INTEGER, p_id_estado_inactivo INTEGER
) RETURNS void LANGUAGE plpgsql AS $function$
BEGIN
    UPDATE entidades.cliente SET id_estado = p_id_estado_inactivo WHERE id_cliente = p_id_cliente;
END;
$function$;

CREATE OR REPLACE FUNCTION operaciones.fn_crear_venta(
    p_numero_orden VARCHAR, p_id_cliente INTEGER, p_id_tecnico INTEGER,
    p_subtotal NUMERIC, p_descuento_total NUMERIC, p_total NUMERIC, p_id_estado INTEGER
) RETURNS void LANGUAGE plpgsql AS $function$
BEGIN
    INSERT INTO operaciones.venta (numero_orden, fecha_venta, id_cliente, id_tecnico, subtotal, descuento_total, total, id_estado)
    VALUES (p_numero_orden, NOW(), p_id_cliente, p_id_tecnico, p_subtotal, p_descuento_total, p_total, p_id_estado);
END;
$function$;

-- Reserva de stock atómica: solo inserta el detalle si logra reservar la cantidad pedida.
CREATE OR REPLACE FUNCTION operaciones.fn_crear_detalle_venta(
    p_id_venta INTEGER, p_id_lote INTEGER, p_cantidad INTEGER,
    p_precio_unitario NUMERIC, p_subtotal_linea NUMERIC,
    p_es_combo_ia BOOLEAN, p_id_promocion INTEGER
) RETURNS void LANGUAGE plpgsql AS $function$
DECLARE
    v_filas_afectadas INTEGER;
BEGIN
    UPDATE inventario.lotes
    SET cantidad_reservada = cantidad_reservada + p_cantidad
    WHERE id_lote = p_id_lote
      AND (cantidad_actual - cantidad_reservada) >= p_cantidad;

    GET DIAGNOSTICS v_filas_afectadas = ROW_COUNT;

    IF v_filas_afectadas = 0 THEN
        RAISE EXCEPTION 'VALIDACION: Stock insuficiente para reservar % unidades del lote %', p_cantidad, p_id_lote;
    END IF;

    INSERT INTO operaciones.detalle_venta (id_venta, id_lote, cantidad, precio_unitario, subtotal_linea, es_combo_ia, id_promocion)
    VALUES (p_id_venta, p_id_lote, p_cantidad, p_precio_unitario, p_subtotal_linea, p_es_combo_ia, p_id_promocion);
END;
$function$;

-- ── 6. Verificación ───────────────────────────────────────────
SELECT 'cat_estado_temporada' AS tabla, count(*) FROM catalogos.cat_estado_temporada
UNION ALL SELECT 'cat_estado_alerta', count(*) FROM catalogos.cat_estado_alerta
UNION ALL SELECT 'cat_estado_promocion', count(*) FROM catalogos.cat_estado_promocion
UNION ALL SELECT 'cat_estado_venta', count(*) FROM catalogos.cat_estado_venta
UNION ALL SELECT 'entidades.cliente', count(*) FROM entidades.cliente
UNION ALL SELECT 'operaciones.venta', count(*) FROM operaciones.venta;
