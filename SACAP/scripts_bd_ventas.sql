-- =============================================================
-- MODULO: VENTAS - Pregunta #1: "Productos más vendidos esta semana"
-- BD: scapa | Esquema: operaciones
-- Crea: operaciones.venta, operaciones.detalle_venta, indices
--       y la funcion operaciones.fn_registrar_venta
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. TABLA operaciones.venta
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operaciones.venta (
    id_venta            SERIAL PRIMARY KEY,
    fecha_venta         TIMESTAMP NOT NULL DEFAULT NOW(),
    id_usuario          INTEGER NOT NULL,
    cliente             VARCHAR(150),
    subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
    iva                 NUMERIC(12,2) NOT NULL DEFAULT 0,
    total               NUMERIC(12,2) NOT NULL DEFAULT 0,
    id_estado_aprobacion INTEGER NOT NULL DEFAULT 2,
    CONSTRAINT fk_venta_usuario FOREIGN KEY (id_usuario)
        REFERENCES seguridad.usuario (id_usuario),
    CONSTRAINT fk_venta_estado FOREIGN KEY (id_estado_aprobacion)
        REFERENCES catalogos.cat_estado_aprobacion (id_estado_aprobacion)
);

COMMENT ON TABLE operaciones.venta IS 'Cabecera de ventas (Pregunta #1 Dashboard IA)';

-- -------------------------------------------------------------
-- 2. TABLA operaciones.detalle_venta
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operaciones.detalle_venta (
    id_detalle       SERIAL PRIMARY KEY,
    id_venta         INTEGER NOT NULL,
    id_producto      INTEGER NOT NULL,
    cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(12,2) NOT NULL,
    subtotal         NUMERIC(12,2) NOT NULL,
    id_lote          INTEGER,
    CONSTRAINT fk_detalle_venta_venta FOREIGN KEY (id_venta)
        REFERENCES operaciones.venta (id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_venta_producto FOREIGN KEY (id_producto)
        REFERENCES inventario.producto (id_producto),
    CONSTRAINT fk_detalle_venta_lote FOREIGN KEY (id_lote)
        REFERENCES inventario.lotes (id_lote)
);

COMMENT ON TABLE operaciones.detalle_venta IS 'Detalle / líneas de venta (Pregunta #1 Dashboard IA)';

-- -------------------------------------------------------------
-- 3. INDICES para ranking de ventas
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS ix_venta_fecha
    ON operaciones.venta (fecha_venta DESC);

CREATE INDEX IF NOT EXISTS ix_venta_estado
    ON operaciones.venta (id_estado_aprobacion);

CREATE INDEX IF NOT EXISTS ix_detalle_venta_venta
    ON operaciones.detalle_venta (id_venta);

CREATE INDEX IF NOT EXISTS ix_detalle_venta_producto
    ON operaciones.detalle_venta (id_producto);

CREATE INDEX IF NOT EXISTS ix_detalle_venta_venta_producto
    ON operaciones.detalle_venta (id_venta, id_producto);

-- -------------------------------------------------------------
-- 4. FUNCION operaciones.fn_registrar_venta
--    Registra cabecera + detalle, genera movimientos
--    DESPACHO VENTA (tipo 3) y descuenta stock por FEFO.
--    p_detalles: JSONB -> [
--      {"id_producto": 1, "cantidad": 20, "precio_unitario": 12.5, "id_lote": 1}
--    ]
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION operaciones.fn_registrar_venta(
    p_id_usuario  INTEGER,
    p_fecha_venta TIMESTAMP,
    p_cliente     VARCHAR,
    p_detalles    JSONB
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta    INTEGER;
    v_total       NUMERIC(12,2) := 0;
    d             JSONB;
    v_id_producto INTEGER;
    v_cantidad    INTEGER;
    v_precio      NUMERIC(12,2);
    v_subtotal    NUMERIC(12,2);
    v_id_lote     INTEGER;
BEGIN
    IF p_detalles IS NULL OR jsonb_array_length(p_detalles) = 0 THEN
        RAISE EXCEPTION 'La venta debe tener al menos un detalle';
    END IF;

    INSERT INTO operaciones.venta (fecha_venta, id_usuario, cliente, id_estado_aprobacion)
    VALUES (COALESCE(p_fecha_venta, NOW()), p_id_usuario, NULLIF(TRIM(p_cliente), ''), 2)
    RETURNING id_venta INTO v_id_venta;

    FOR d IN SELECT jsonb_array_elements(p_detalles)
    LOOP
        v_id_producto := (d->>'id_producto')::INTEGER;
        v_cantidad    := (d->>'cantidad')::INTEGER;
        v_precio      := NULLIF((d->>'precio_unitario')::NUMERIC, NULL);
        v_id_lote     := NULLIF((d->>'id_lote')::INTEGER, NULL);

        IF v_precio IS NULL THEN
            SELECT precio INTO v_precio FROM inventario.producto WHERE id_producto = v_id_producto;
        END IF;

        -- Lote FEFO si no se especifica (evita estado CADUCADO / AGOTADO)
        IF v_id_lote IS NULL THEN
            SELECT l.id_lote INTO v_id_lote
            FROM inventario.lotes l
            WHERE l.id_producto = v_id_producto
              AND l.activo = TRUE
              AND l.cantidad_actual >= v_cantidad
              AND l.id_estado_lote IN (1, 3)
            ORDER BY l.fecha_vencimiento ASC
            LIMIT 1;
        END IF;

        IF v_id_lote IS NULL THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto % (cantidad %)', v_id_producto, v_cantidad;
        END IF;

        v_subtotal := v_cantidad * v_precio;
        v_total    := v_total + v_subtotal;

        INSERT INTO operaciones.detalle_venta
            (id_venta, id_producto, cantidad, precio_unitario, subtotal, id_lote)
        VALUES
            (v_id_venta, v_id_producto, v_cantidad, v_precio, v_subtotal, v_id_lote);

        -- Genera movimiento DESPACHO VENTA (tipo 3, estado 2 APROBADO)
        -- y descuenta el stock del lote (fn_crear_movimiento_inventario)
        PERFORM operaciones.fn_crear_movimiento_inventario(
            v_cantidad,
            'Venta #' || v_id_venta || ' - Producto ' || v_id_producto,
            v_id_lote,
            3,
            p_id_usuario,
            2
        );
    END LOOP;

    UPDATE operaciones.venta
    SET subtotal = v_total, total = v_total
    WHERE id_venta = v_id_venta;

    RETURN v_id_venta;
END;
$$;

GRANT USAGE ON SCHEMA operaciones TO agro_administrador, agro_supervisor, agro_bodeguero, agro_tecnico_campo, agro_proveedor, agro_gerente;
GRANT SELECT, INSERT ON operaciones.venta, operaciones.detalle_venta TO agro_administrador, agro_supervisor, agro_bodeguero, agro_gerente;
GRANT USAGE, SELECT ON SEQUENCE operaciones.venta_id_venta_seq, operaciones.detalle_venta_id_detalle_seq TO agro_administrador, agro_supervisor, agro_bodeguero, agro_gerente;

COMMIT;
