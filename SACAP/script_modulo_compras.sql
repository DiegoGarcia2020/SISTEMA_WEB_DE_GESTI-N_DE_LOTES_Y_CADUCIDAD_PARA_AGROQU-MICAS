-- ===========================================================
-- SCRIPT DE MIGRACIÓN: Módulo 1 - Compras e Inventario Inicial
-- Sistema SACAP - Gestión Agrícola de Cacao
-- Ejecutar en PostgreSQL como superusuario o dueño del schema
-- ===========================================================

-- ============================================================
-- 1. AJUSTE EN TABLA PRODUCTO: Agregar stock_minimo
--    Umbral mínimo para generar alertas de reabastecimiento
-- ============================================================
ALTER TABLE inventario.producto
    ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 10;

COMMENT ON COLUMN inventario.producto.stock_minimo
    IS 'Cantidad mínima aceptable en inventario. Si el stock total cae por debajo, se genera alerta de reabastecimiento.';

-- ============================================================
-- 2. AJUSTE EN TABLA LOTES: Agregar costo_unitario_real
--    Para almacenar el costo promedio calculado con bonificaciones
-- ============================================================
ALTER TABLE inventario.lotes
    ADD COLUMN IF NOT EXISTS costo_unitario_real DECIMAL(10,2);

ALTER TABLE inventario.lotes
    ADD COLUMN IF NOT EXISTS id_orden_compra INTEGER;

COMMENT ON COLUMN inventario.lotes.costo_unitario_real
    IS 'Costo real promedio del producto en este lote. Si la compra incluye bonificaciones (regalos), el costo se distribuye entre todas las unidades. Ej: 100 productos a $10 + 10 regalados = $9.09 c/u.';

COMMENT ON COLUMN inventario.lotes.id_orden_compra
    IS 'Referencia a la orden de compra que originó este lote. Permite trazabilidad financiera completa.';

-- ============================================================
-- 3. TABLA: operaciones.orden_compra (Cabecera financiera)
--    Registra la transcripción de la factura del proveedor
-- ============================================================
CREATE TABLE IF NOT EXISTS operaciones.orden_compra (
    id                  SERIAL PRIMARY KEY,
    id_proveedor        INTEGER NOT NULL,
    numero_factura      VARCHAR(50) NOT NULL,
    fecha_emision       DATE NOT NULL,
    subtotal_bruto      DECIMAL(10,2) DEFAULT 0.00,
    total_descuentos    DECIMAL(10,2) DEFAULT 0.00,
    costo_transporte    DECIMAL(10,2) DEFAULT 0.00,
    impuestos           DECIMAL(10,2) DEFAULT 0.00,
    total_neto          DECIMAL(10,2) DEFAULT 0.00,
    estado              VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_registro      TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_orden_compra_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES entidades.proveedor(id_proveedor)
        ON DELETE RESTRICT,

    CONSTRAINT chk_estado_orden_compra
        CHECK (estado IN ('PENDIENTE', 'RECEPCIONADA', 'ANULADA'))
);

COMMENT ON TABLE operaciones.orden_compra
    IS 'Cabecera de la orden de compra. El Supervisor transcribe la factura física del proveedor en esta tabla.';
COMMENT ON COLUMN operaciones.orden_compra.subtotal_bruto
    IS 'Suma de (cantidad * precio_unitario) de todos los ítems NO bonificación, ANTES de aplicar descuentos.';
COMMENT ON COLUMN operaciones.orden_compra.total_descuentos
    IS 'Suma total de todos los descuentos por ítem aplicados a la orden.';
COMMENT ON COLUMN operaciones.orden_compra.costo_transporte
    IS 'Costo del flete/envío pagado al proveedor. Ingresado manualmente por el Supervisor.';
COMMENT ON COLUMN operaciones.orden_compra.total_neto
    IS 'Lo que realmente se paga: subtotal_bruto - total_descuentos + costo_transporte + impuestos.';
COMMENT ON COLUMN operaciones.orden_compra.estado
    IS 'PENDIENTE = Factura registrada, esperando recepción física. RECEPCIONADA = Bodeguero confirmó ingreso. ANULADA = Cancelada.';

-- ============================================================
-- 4. TABLA: operaciones.detalle_compra (Desglose por producto)
--    Cada fila representa un producto de la factura del proveedor
-- ============================================================
CREATE TABLE IF NOT EXISTS operaciones.detalle_compra (
    id                      SERIAL PRIMARY KEY,
    id_orden_compra         INTEGER NOT NULL,
    id_producto             INTEGER NOT NULL,
    cantidad                INTEGER NOT NULL,
    precio_unitario         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    porcentaje_descuento    DECIMAL(5,2) DEFAULT 0.00,
    valor_descuento         DECIMAL(10,2) DEFAULT 0.00,
    subtotal                DECIMAL(10,2) DEFAULT 0.00,
    es_bonificacion         BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_detalle_orden_compra
        FOREIGN KEY (id_orden_compra) REFERENCES operaciones.orden_compra(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto)
        ON DELETE RESTRICT,

    CONSTRAINT chk_cantidad_positiva
        CHECK (cantidad > 0),

    CONSTRAINT chk_porcentaje_descuento
        CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100)
);

COMMENT ON TABLE operaciones.detalle_compra
    IS 'Desglose por producto de la orden de compra. Incluye ítems pagados y bonificaciones (regalos del proveedor).';
COMMENT ON COLUMN operaciones.detalle_compra.porcentaje_descuento
    IS 'Porcentaje de descuento aplicado a este ítem. Ej: 10.00 para un 10% de descuento.';
COMMENT ON COLUMN operaciones.detalle_compra.valor_descuento
    IS 'Valor monetario del descuento: (cantidad * precio_unitario) * (porcentaje_descuento / 100).';
COMMENT ON COLUMN operaciones.detalle_compra.subtotal
    IS 'Subtotal neto de este ítem: (cantidad * precio_unitario) - valor_descuento. Para bonificaciones = $0.';
COMMENT ON COLUMN operaciones.detalle_compra.es_bonificacion
    IS 'TRUE = Producto de regalo (precio $0). Se incluye en el conteo de unidades para cálculo de costo promedio.';

-- ============================================================
-- 5. FOREIGN KEY diferida para lotes → orden_compra
--    Solo agregar si no existe
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_lote_orden_compra'
        AND table_schema = 'inventario'
        AND table_name = 'lotes'
    ) THEN
        ALTER TABLE inventario.lotes
            ADD CONSTRAINT fk_lote_orden_compra
            FOREIGN KEY (id_orden_compra)
            REFERENCES operaciones.orden_compra(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================
-- 6. TIPO DE MOVIMIENTO: INGRESO_COMPRA
--    Para registrar entradas al inventario desde órdenes de compra
-- ============================================================
INSERT INTO catalogos.cat_tipo_movimiento (nombre, naturaleza, activo)
SELECT 'INGRESO_COMPRA', 'ENTRADA', true
WHERE NOT EXISTS (
    SELECT 1 FROM catalogos.cat_tipo_movimiento WHERE nombre = 'INGRESO_COMPRA'
);

-- ============================================================
-- 7. ESTADO DE LOTE: FLOTANTE
--    Para lotes recién ingresados que aún no tienen ubicación física
-- ============================================================
-- Nota: Si ya existe un catálogo cat_estado_lote, insertar el estado FLOTANTE.
-- Si el campo id_estado_lote se maneja directamente con IDs, usaremos 5 = FLOTANTE.
-- Descomenta y ajusta según tu catálogo existente:
-- INSERT INTO catalogos.cat_estado_lote (nombre, descripcion, activo)
-- SELECT 'FLOTANTE', 'Lote recibido pero sin ubicación física asignada en bodega', true
-- WHERE NOT EXISTS (SELECT 1 FROM catalogos.cat_estado_lote WHERE nombre = 'FLOTANTE');

-- ============================================================
-- 8. ÍNDICES para rendimiento en consultas frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orden_compra_proveedor
    ON operaciones.orden_compra(id_proveedor);

CREATE INDEX IF NOT EXISTS idx_orden_compra_estado
    ON operaciones.orden_compra(estado);

CREATE INDEX IF NOT EXISTS idx_orden_compra_fecha
    ON operaciones.orden_compra(fecha_emision);

CREATE INDEX IF NOT EXISTS idx_detalle_compra_orden
    ON operaciones.detalle_compra(id_orden_compra);

CREATE INDEX IF NOT EXISTS idx_detalle_compra_producto
    ON operaciones.detalle_compra(id_producto);

CREATE INDEX IF NOT EXISTS idx_lotes_orden_compra
    ON inventario.lotes(id_orden_compra);

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT 'Migración Módulo Compras ejecutada correctamente.' AS resultado;
SELECT 'Tablas creadas: operaciones.orden_compra, operaciones.detalle_compra' AS tablas;
SELECT 'Columnas añadidas: inventario.producto.stock_minimo, inventario.lotes.costo_unitario_real, inventario.lotes.id_orden_compra' AS columnas;
