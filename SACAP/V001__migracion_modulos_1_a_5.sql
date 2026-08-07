-- =========================================================================
-- MIGRACIÓN MÓDULOS 1 A 5
-- =========================================================================

-- ==========================================
-- MÓDULO 1 - PROVEEDOR COMO REGISTRO
-- ==========================================

-- 1. Limpiar tabla proveedor
ALTER TABLE entidades.proveedor 
  DROP COLUMN IF EXISTS id_usuario,
  RENAME COLUMN nombre TO nombre_representante;

ALTER TABLE entidades.proveedor
  ADD COLUMN IF NOT EXISTS telefono_empresa VARCHAR(30),
  ADD COLUMN IF NOT EXISTS correo_contacto VARCHAR(150),
  ADD COLUMN IF NOT EXISTS id_empresa INTEGER REFERENCES entidades.empresa(id_empresa),
  ADD COLUMN IF NOT EXISTS id_ciudad INTEGER REFERENCES geografia.ciudad(id_ciudad),
  ADD CONSTRAINT uk_proveedor_ruc UNIQUE (ruc);

-- 2. Limpiar usuarios con rol PROVEEDOR (Opcional: Si es un entorno limpio, o si se desea borrar)
-- DELETE FROM seguridad.usuario_rol WHERE id_rol = (SELECT id_rol FROM seguridad.rol WHERE nombre = 'PROVEEDOR');
-- DELETE FROM seguridad.usuario WHERE id_usuario NOT IN (SELECT id_usuario FROM seguridad.usuario_rol);

-- 3. Actualizar funciones de BD de proveedor
DROP FUNCTION IF EXISTS entidades.fn_crear_proveedor(varchar, varchar, integer, varchar, varchar, varchar, varchar, integer, integer);
DROP FUNCTION IF EXISTS entidades.fn_actualizar_proveedor(integer, varchar, integer, varchar, varchar, varchar, varchar, integer, integer);
DROP FUNCTION IF EXISTS entidades.fn_eliminar_proveedor(integer);

CREATE OR REPLACE FUNCTION entidades.fn_crear_proveedor(
    p_id_estado integer, 
    p_ruc character varying, 
    p_nombre_representante character varying, 
    p_direccion character varying, 
    p_telefono character varying,
    p_telefono_empresa character varying, 
    p_correo_contacto character varying,
    p_id_empresa integer, 
    p_id_ciudad integer
) RETURNS void AS $$
BEGIN
    INSERT INTO entidades.proveedor (
        nombre_representante, ruc, telefono, telefono_empresa, direccion, correo_contacto, id_estado, id_empresa, id_ciudad
    ) VALUES (
        p_nombre_representante, p_ruc, p_telefono, p_telefono_empresa, p_direccion, p_correo_contacto, p_id_estado, p_id_empresa, p_id_ciudad
    );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION entidades.fn_actualizar_proveedor(
    p_id_proveedor integer,
    p_id_estado integer, 
    p_ruc character varying, 
    p_nombre_representante character varying, 
    p_direccion character varying, 
    p_telefono character varying,
    p_telefono_empresa character varying, 
    p_correo_contacto character varying,
    p_id_empresa integer, 
    p_id_ciudad integer
) RETURNS void AS $$
BEGIN
    UPDATE entidades.proveedor
    SET nombre_representante = p_nombre_representante,
        ruc = p_ruc,
        telefono = p_telefono,
        telefono_empresa = p_telefono_empresa,
        direccion = p_direccion,
        correo_contacto = p_correo_contacto,
        id_estado = p_id_estado,
        id_empresa = p_id_empresa,
        id_ciudad = p_id_ciudad
    WHERE id_proveedor = p_id_proveedor;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION entidades.fn_eliminar_proveedor(p_id_proveedor integer) RETURNS void AS $$
BEGIN
    DELETE FROM entidades.proveedor WHERE id_proveedor = p_id_proveedor;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1.2 TABLA PUENTE PROVEEDOR-PRODUCTO
-- ==========================================
CREATE TABLE IF NOT EXISTS entidades.proveedor_producto (
  id_proveedor_producto SERIAL PRIMARY KEY,
  id_proveedor   INTEGER NOT NULL REFERENCES entidades.proveedor(id_proveedor),
  id_producto    INTEGER NOT NULL REFERENCES inventario.producto(id_producto),
  precio_referencial NUMERIC(10,2),
  codigo_producto_proveedor VARCHAR(50),
  id_estado      INTEGER NOT NULL DEFAULT 1,
  UNIQUE(id_proveedor, id_producto)
);
CREATE INDEX IF NOT EXISTS idx_pp_proveedor ON entidades.proveedor_producto(id_proveedor);
CREATE INDEX IF NOT EXISTS idx_pp_producto ON entidades.proveedor_producto(id_producto);

-- ==========================================
-- MÓDULO 2 - CLASIFICACIÓN AGRONÓMICA
-- ==========================================

CREATE TABLE IF NOT EXISTS catalogos.toxicidad (
  id_toxicidad SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  color_etiqueta VARCHAR(50),
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS catalogos.formulacion (
  id_formulacion SERIAL PRIMARY KEY,
  sigla VARCHAR(20) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255)
);

ALTER TABLE inventario.producto
  ADD COLUMN IF NOT EXISTS ingrediente_activo VARCHAR(200),
  ADD COLUMN IF NOT EXISTS periodo_carencia_dias INTEGER,
  ADD COLUMN IF NOT EXISTS id_toxicidad INTEGER REFERENCES catalogos.toxicidad(id_toxicidad),
  ADD COLUMN IF NOT EXISTS id_formulacion INTEGER REFERENCES catalogos.formulacion(id_formulacion);

-- Insertar datos básicos
INSERT INTO catalogos.toxicidad (nombre, color_etiqueta) VALUES 
('Ligeramente Tóxico', 'Verde'),
('Moderadamente Tóxico', 'Amarillo'),
('Altamente Tóxico', 'Rojo') ON CONFLICT DO NOTHING;

INSERT INTO catalogos.formulacion (sigla, nombre) VALUES 
('SC', 'Suspensión Concentrada'),
('EC', 'Concentrado Emulsionable'),
('WP', 'Polvo Mojable'),
('WG', 'Gránulos Dispersables') ON CONFLICT DO NOTHING;

-- Actualizar funciones PL/pgSQL
DROP FUNCTION IF EXISTS inventario.fn_crear_producto(varchar, varchar, varchar, numeric, integer, integer);
CREATE OR REPLACE FUNCTION inventario.fn_crear_producto(
    p_nombre character varying,
    p_descripcion character varying,
    p_unidad_medida character varying,
    p_precio numeric,
    p_id_categoria integer,
    p_id_estado integer,
    p_ingrediente_activo character varying DEFAULT NULL,
    p_periodo_carencia_dias integer DEFAULT NULL,
    p_id_toxicidad integer DEFAULT NULL,
    p_id_formulacion integer DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO inventario.producto (
        nombre, descripcion, unidad_medida, precio, id_categoria, id_estado, 
        ingrediente_activo, periodo_carencia_dias, id_toxicidad, id_formulacion
    ) VALUES (
        p_nombre, p_descripcion, p_unidad_medida, p_precio, p_id_categoria, p_id_estado,
        p_ingrediente_activo, p_periodo_carencia_dias, p_id_toxicidad, p_id_formulacion
    );
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS inventario.fn_actualizar_producto(integer, varchar, varchar, varchar, numeric, integer, integer);
CREATE OR REPLACE FUNCTION inventario.fn_actualizar_producto(
    p_id_producto integer,
    p_nombre character varying,
    p_descripcion character varying,
    p_unidad_medida character varying,
    p_precio numeric,
    p_id_categoria integer,
    p_id_estado integer,
    p_ingrediente_activo character varying DEFAULT NULL,
    p_periodo_carencia_dias integer DEFAULT NULL,
    p_id_toxicidad integer DEFAULT NULL,
    p_id_formulacion integer DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE inventario.producto
    SET nombre = p_nombre,
        descripcion = p_descripcion,
        unidad_medida = p_unidad_medida,
        precio = p_precio,
        id_categoria = p_id_categoria,
        id_estado = p_id_estado,
        ingrediente_activo = p_ingrediente_activo,
        periodo_carencia_dias = p_periodo_carencia_dias,
        id_toxicidad = p_id_toxicidad,
        id_formulacion = p_id_formulacion
    WHERE id_producto = p_id_producto;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- MÓDULO 4 - DEVOLUCIONES DE VENTA
-- ==========================================
ALTER TABLE operaciones.devoluciones_venta
  ADD COLUMN IF NOT EXISTS id_lote INTEGER REFERENCES inventario.lote(id_lote);
