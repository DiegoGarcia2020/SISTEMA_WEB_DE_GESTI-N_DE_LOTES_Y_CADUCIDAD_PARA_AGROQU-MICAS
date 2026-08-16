-- Añadir la columna id_lote a la tabla promociones
ALTER TABLE ia_alertas.promociones
ADD COLUMN id_lote INTEGER NULL REFERENCES inventario.lote(id_lote);

-- Reemplazar la función de creación para incluir el lote
CREATE OR REPLACE FUNCTION ia_alertas.fn_crear_promocion(
    p_nombre_promocion character varying,
    p_descripcion text,
    p_descuento_global numeric,
    p_fecha_inicio date,
    p_fecha_fin date,
    p_id_sugerencia integer,
    p_id_usuario_aprueba integer,
    p_id_estado integer,
    p_id_lote integer
) RETURNS void AS $$
BEGIN
    INSERT INTO ia_alertas.promociones (
        nombre_promocion,
        descripcion,
        descuento_global,
        fecha_inicio,
        fecha_fin,
        id_sugerencia,
        id_usuario_aprueba,
        id_estado,
        id_lote
    ) VALUES (
        p_nombre_promocion,
        p_descripcion,
        p_descuento_global,
        p_fecha_inicio,
        p_fecha_fin,
        p_id_sugerencia,
        p_id_usuario_aprueba,
        p_id_estado,
        p_id_lote
    );
END;
$$ LANGUAGE plpgsql;
