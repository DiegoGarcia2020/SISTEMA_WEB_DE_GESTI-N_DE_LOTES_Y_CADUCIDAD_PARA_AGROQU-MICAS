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
)
RETURNS void AS $$
BEGIN
    INSERT INTO entidades.proveedor (
        id_estado,
        ruc,
        nombre_representante,
        direccion,
        telefono,
        telefono_empresa,
        correo_contacto,
        id_empresa,
        id_ciudad
    ) VALUES (
        p_id_estado,
        p_ruc,
        p_nombre_representante,
        p_direccion,
        p_telefono,
        p_telefono_empresa,
        p_correo_contacto,
        p_id_empresa,
        p_id_ciudad
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
)
RETURNS void AS $$
BEGIN
    UPDATE entidades.proveedor
    SET 
        id_estado = p_id_estado,
        ruc = p_ruc,
        nombre_representante = p_nombre_representante,
        direccion = p_direccion,
        telefono = p_telefono,
        telefono_empresa = p_telefono_empresa,
        correo_contacto = p_correo_contacto,
        id_empresa = p_id_empresa,
        id_ciudad = p_id_ciudad
    WHERE id_proveedor = p_id_proveedor;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION entidades.fn_eliminar_proveedor(
    p_id_proveedor integer
)
RETURNS void AS $$
BEGIN
    DELETE FROM entidades.proveedor
    WHERE id_proveedor = p_id_proveedor;
END;
$$ LANGUAGE plpgsql;
