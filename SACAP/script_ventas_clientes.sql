-- ===========================================================
-- SCRIPT DE MIGRACIÓN: Sistema de Ventas SACAP
-- Ejecutar en PostgreSQL como superusuario o dueño del schema
-- ===========================================================

-- ============================================================
-- 1. TABLA: entidades.clientes
--    Agrupa las fincas/clientes a los que atienden los técnicos
-- ============================================================
CREATE TABLE IF NOT EXISTS entidades.clientes (
    id_cliente      SERIAL PRIMARY KEY,
    nombre_finca    VARCHAR(200) NOT NULL,
    cedula          VARCHAR(13)  NOT NULL UNIQUE,
    telefono        VARCHAR(30),
    direccion       VARCHAR(300),
    id_estado       INTEGER DEFAULT 1,
    id_tecnico_asignado INTEGER,
    CONSTRAINT fk_cliente_tecnico FOREIGN KEY (id_tecnico_asignado)
        REFERENCES seguridad.usuarios(id_usuario) ON DELETE SET NULL
);

COMMENT ON TABLE entidades.clientes IS 'Clientes/Fincas que compran agroquímicos. Relacionados con el técnico que los atiende.';
COMMENT ON COLUMN entidades.clientes.cedula IS 'Cédula de identidad del dueño de la finca (10 dígitos Ecuador)';

-- ============================================================
-- 2. FUNCIÓN: entidades.fn_crear_cliente
-- ============================================================
CREATE OR REPLACE FUNCTION entidades.fn_crear_cliente(
    p_nombre_finca    VARCHAR(200),
    p_cedula          VARCHAR(13),
    p_telefono        VARCHAR(30),
    p_direccion       VARCHAR(300),
    p_id_tecnico      INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO entidades.clientes(nombre_finca, cedula, telefono, direccion, id_tecnico_asignado, id_estado)
    VALUES (p_nombre_finca, p_cedula, p_telefono, p_direccion, p_id_tecnico, 1)
    RETURNING id_cliente INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. AMPLIAR operaciones.uso_campo
--    Agregar columnas para soportar el flujo de Orden de Pedido
--    sin romper la estructura existente
-- ============================================================

-- id_cliente: a quién va el pedido
ALTER TABLE operaciones.uso_campo
    ADD COLUMN IF NOT EXISTS id_cliente INTEGER
    REFERENCES entidades.clientes(id_cliente) ON DELETE SET NULL;

-- descripcion_plaga: el diagnóstico del técnico
ALTER TABLE operaciones.uso_campo
    ADD COLUMN IF NOT EXISTS descripcion_plaga VARCHAR(500);

-- tipo_registro: 'USO_CAMPO' (histórico) o 'ORDEN_PEDIDO' (nuevo flujo ventas)
ALTER TABLE operaciones.uso_campo
    ADD COLUMN IF NOT EXISTS tipo_registro VARCHAR(50) DEFAULT 'USO_CAMPO';

-- id_estado_pedido: flujo del pedido
--   1=PENDIENTE_BODEGA, 2=DESPACHADO, 3=ENTREGADO, 4=CANCELADO, 5=DEVUELTO
ALTER TABLE operaciones.uso_campo
    ADD COLUMN IF NOT EXISTS id_estado_pedido INTEGER DEFAULT 1;

-- id_combo_aplicado: referencia opcional al combo/promo que usó el técnico
ALTER TABLE operaciones.uso_campo
    ADD COLUMN IF NOT EXISTS id_combo_aplicado INTEGER
    REFERENCES operaciones.promociones(id_promocion) ON DELETE SET NULL;

-- cantidad_reservada: unidades bloqueadas del lote cuando se crea el pedido
-- (se libera cuando el bodeguero despacha)
ALTER TABLE operaciones.uso_campo
    ADD COLUMN IF NOT EXISTS cantidad_reservada INTEGER DEFAULT 0;

COMMENT ON COLUMN operaciones.uso_campo.tipo_registro IS 'USO_CAMPO = aplicación agrícola clásica. ORDEN_PEDIDO = pedido de venta al cliente.';
COMMENT ON COLUMN operaciones.uso_campo.id_estado_pedido IS '1=PENDIENTE_BODEGA, 2=DESPACHADO, 3=ENTREGADO, 4=CANCELADO, 5=DEVUELTO';
COMMENT ON COLUMN operaciones.uso_campo.cantidad_reservada IS 'Unidades reservadas en el lote. Se libera al despachar.';

-- ============================================================
-- 4. AMPLIAR inventario.lotes
--    Columna cantidad_reservada para bloquear stock en tránsito
-- ============================================================
ALTER TABLE inventario.lotes
    ADD COLUMN IF NOT EXISTS cantidad_reservada INTEGER DEFAULT 0;

COMMENT ON COLUMN inventario.lotes.cantidad_reservada IS 'Stock reservado por pedidos pendientes. Stock disponible real = cantidad_actual - cantidad_reservada.';

-- ============================================================
-- 5. TIPOS DE MOVIMIENTO para flujo de ventas
--    Insertar si no existen
-- ============================================================
INSERT INTO catalogos.cat_tipo_movimiento (nombre, naturaleza, activo)
SELECT 'DESPACHO_CLIENTE', 'SALIDA', true
WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_tipo_movimiento WHERE nombre = 'DESPACHO_CLIENTE');

INSERT INTO catalogos.cat_tipo_movimiento (nombre, naturaleza, activo)
SELECT 'DEVOLUCION_CLIENTE', 'ENTRADA', true
WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_tipo_movimiento WHERE nombre = 'DEVOLUCION_CLIENTE');

INSERT INTO catalogos.cat_tipo_movimiento (nombre, naturaleza, activo)
SELECT 'DEVOLUCION_PROVEEDOR', 'SALIDA', true
WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_tipo_movimiento WHERE nombre = 'DEVOLUCION_PROVEEDOR');

-- ============================================================
-- 6. FUNCIÓN: operaciones.fn_crear_orden_pedido
--    Crea el pedido en uso_campo y reserva stock en el lote
-- ============================================================
CREATE OR REPLACE FUNCTION operaciones.fn_crear_orden_pedido(
    p_id_cliente        INTEGER,
    p_descripcion_plaga VARCHAR(500),
    p_id_lote           INTEGER,
    p_cantidad          INTEGER,
    p_observacion       TEXT,
    p_id_usuario_tecnico INTEGER,
    p_id_combo_aplicado INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_stock_disp INTEGER;
    v_id_uso     INTEGER;
BEGIN
    -- Validar stock disponible (actual - reservado)
    SELECT (cantidad_actual - COALESCE(cantidad_reservada, 0))
    INTO v_stock_disp
    FROM inventario.lotes
    WHERE id_lote = p_id_lote;

    IF v_stock_disp IS NULL OR v_stock_disp < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %. Solicitado: %.', COALESCE(v_stock_disp, 0), p_cantidad;
    END IF;

    -- Insertar orden de pedido reutilizando uso_campo
    INSERT INTO operaciones.uso_campo(
        parcela, cultivo, fecha_aplicacion, cantidad_usada, observacion,
        id_estado, id_lote, id_usuario_tecnico,
        id_cliente, descripcion_plaga, tipo_registro, id_estado_pedido,
        id_combo_aplicado, cantidad_reservada
    )
    VALUES (
        'N/A', 'N/A', CURRENT_DATE, p_cantidad, p_observacion,
        1, p_id_lote, p_id_usuario_tecnico,
        p_id_cliente, p_descripcion_plaga, 'ORDEN_PEDIDO', 1,
        p_id_combo_aplicado, p_cantidad
    )
    RETURNING id_uso INTO v_id_uso;

    -- Reservar stock en el lote
    UPDATE inventario.lotes
    SET cantidad_reservada = COALESCE(cantidad_reservada, 0) + p_cantidad
    WHERE id_lote = p_id_lote;

    RETURN v_id_uso;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 7. FUNCIÓN: operaciones.fn_despachar_pedido
--    Marca el pedido como despachado, libera reserva y resta stock
-- ============================================================
CREATE OR REPLACE FUNCTION operaciones.fn_despachar_pedido(
    p_id_uso     INTEGER,
    p_id_usuario INTEGER
) RETURNS VOID AS $$
DECLARE
    v_rec RECORD;
    v_id_tipo_despacho INTEGER;
BEGIN
    -- Traer datos del pedido
    SELECT u.id_uso, u.id_lote, u.cantidad_usada, u.id_estado_pedido
    INTO v_rec
    FROM operaciones.uso_campo u
    WHERE u.id_uso = p_id_uso AND u.tipo_registro = 'ORDEN_PEDIDO';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden de pedido no encontrada con ID: %', p_id_uso;
    END IF;

    IF v_rec.id_estado_pedido != 1 THEN
        RAISE EXCEPTION 'El pedido % no está en estado PENDIENTE_BODEGA.', p_id_uso;
    END IF;

    -- Obtener id del tipo de movimiento DESPACHO_CLIENTE
    SELECT id_tipo_movimiento INTO v_id_tipo_despacho
    FROM catalogos.cat_tipo_movimiento WHERE nombre = 'DESPACHO_CLIENTE' LIMIT 1;

    -- Registrar movimiento de inventario
    PERFORM operaciones.fn_crear_movimiento_inventario(
        v_rec.cantidad_usada,
        'Despacho al cliente - Pedido #' || p_id_uso::text,
        v_rec.id_lote,
        v_id_tipo_despacho,
        p_id_usuario,
        1 -- Aprobado directamente al despachar
    );

    -- Restar stock real y liberar reserva
    UPDATE inventario.lotes
    SET cantidad_actual    = GREATEST(0, cantidad_actual - v_rec.cantidad_usada),
        cantidad_reservada = GREATEST(0, COALESCE(cantidad_reservada, 0) - v_rec.cantidad_usada)
    WHERE id_lote = v_rec.id_lote;

    -- Actualizar estado del pedido a DESPACHADO
    UPDATE operaciones.uso_campo
    SET id_estado_pedido = 2, cantidad_reservada = 0
    WHERE id_uso = p_id_uso;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. FUNCIÓN: operaciones.fn_devolucion_cliente
--    Registra una devolución de cliente y suma stock de vuelta
-- ============================================================
CREATE OR REPLACE FUNCTION operaciones.fn_devolucion_cliente(
    p_id_pedido_original INTEGER,
    p_motivo             TEXT,
    p_cantidad           INTEGER,
    p_id_lote            INTEGER,
    p_id_usuario         INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_id_dev    INTEGER;
    v_id_tipo   INTEGER;
BEGIN
    -- Obtener id tipo DEVOLUCION_CLIENTE
    SELECT id_tipo_movimiento INTO v_id_tipo
    FROM catalogos.cat_tipo_movimiento WHERE nombre = 'DEVOLUCION_CLIENTE' LIMIT 1;

    -- Registrar en devoluciones con proveedor NULL (es de cliente)
    INSERT INTO operaciones.devoluciones(
        motivo, cantidad, fecha_devolucion, id_estado_aprobacion,
        id_lote, id_proveedor, id_usuario_supervisor
    )
    VALUES(
        p_motivo || ' (Ref. Pedido #' || COALESCE(p_id_pedido_original::text, 'N/A') || ')',
        p_cantidad,
        NOW(),
        1, -- Aprobado automáticamente (no requiere supervisión)
        p_id_lote,
        NULL,
        p_id_usuario
    )
    RETURNING id_devolucion INTO v_id_dev;

    -- Registrar movimiento de ENTRADA en inventario
    PERFORM operaciones.fn_crear_movimiento_inventario(
        p_cantidad,
        'Devolución de cliente - Pedido #' || COALESCE(p_id_pedido_original::text, 'N/A'),
        p_id_lote,
        v_id_tipo,
        p_id_usuario,
        1 -- Aprobado
    );

    -- Sumar stock de vuelta al lote
    UPDATE inventario.lotes
    SET cantidad_actual = COALESCE(cantidad_actual, 0) + p_cantidad
    WHERE id_lote = p_id_lote;

    -- Actualizar pedido original a DEVUELTO si existe
    IF p_id_pedido_original IS NOT NULL THEN
        UPDATE operaciones.uso_campo
        SET id_estado_pedido = 5
        WHERE id_uso = p_id_pedido_original AND tipo_registro = 'ORDEN_PEDIDO';
    END IF;

    RETURN v_id_dev;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Verificación
-- ============================================================
SELECT 'Migración completada exitosamente. Tablas y funciones creadas.' AS resultado;
