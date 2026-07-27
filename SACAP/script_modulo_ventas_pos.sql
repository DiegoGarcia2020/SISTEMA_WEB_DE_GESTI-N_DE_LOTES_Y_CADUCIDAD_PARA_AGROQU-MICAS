-- ===========================================================
-- SCRIPT DE MIGRACIÓN: Módulo de Ventas en Campo (POS)
-- Ejecutar en PostgreSQL como superusuario o dueño del schema
-- ===========================================================

-- 1. Crear tabla de Ventas
CREATE TABLE IF NOT EXISTS operaciones.ventas (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    id_tecnico INTEGER NOT NULL,
    numero_comprobante VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    iva_aplicado NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA',
    costo_envio NUMERIC(10, 2),
    metodo_pago VARCHAR(30),
    referencia_pago VARCHAR(100),
    fecha_estimada_entrega DATE,
    ventana_horaria VARCHAR(50),
    CONSTRAINT fk_ventas_cliente FOREIGN KEY (id_cliente) REFERENCES entidades.clientes(id_cliente),
    CONSTRAINT fk_ventas_tecnico FOREIGN KEY (id_tecnico) REFERENCES seguridad.usuarios(id_usuario)
);

COMMENT ON TABLE operaciones.ventas IS 'Cabecera de las ventas realizadas en campo por el Técnico-Comercial';

-- 2. Crear tabla de Detalles de Venta
CREATE TABLE IF NOT EXISTS operaciones.detalle_ventas (
    id SERIAL PRIMARY KEY,
    id_venta INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    es_sugerencia_ia BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES operaciones.ventas(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto)
);

COMMENT ON TABLE operaciones.detalle_ventas IS 'Detalle de los productos vendidos en la Orden de Venta en campo';

-- 3. Crear tabla de Devoluciones de Venta (Smart POS)
CREATE TABLE IF NOT EXISTS operaciones.devoluciones_venta (
    id SERIAL PRIMARY KEY,
    id_venta INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad_devuelta INTEGER NOT NULL,
    motivo VARCHAR(50) NOT NULL,
    fecha_solicitud TIMESTAMP NOT NULL,
    estado_logistico VARCHAR(30) NOT NULL,
    estado_inventario VARCHAR(30),
    CONSTRAINT fk_devolucion_venta FOREIGN KEY (id_venta) REFERENCES operaciones.ventas(id) ON DELETE CASCADE,
    CONSTRAINT fk_devolucion_producto FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto)
);

COMMENT ON TABLE operaciones.devoluciones_venta IS 'Registro de devoluciones de productos desde el campo por el cliente hacia el Bodeguero';
