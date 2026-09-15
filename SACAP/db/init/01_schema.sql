--
-- PostgreSQL database dump
--

\restrict r4DgjLa61E8M798jzYTPfnewgabZS0cR0cZ543ezCPCQ5cFQKps8QAOfuWpjvDw

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: catalogos; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA catalogos;


--
-- Name: entidades; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA entidades;


--
-- Name: geografia; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA geografia;


--
-- Name: gerencia; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA gerencia;


--
-- Name: ia_alertas; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA ia_alertas;


--
-- Name: inventario; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA inventario;


--
-- Name: operaciones; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA operaciones;


--
-- Name: seguridad; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA seguridad;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: fn_actualizar_estado_aprobacion(integer, character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_actualizar_estado_aprobacion(p_id_estado_aprobacion integer, p_nuevo_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_estado_aprobacion
    SET nombre = UPPER(TRIM(p_nuevo_nombre))
    WHERE id_estado_aprobacion = p_id_estado_aprobacion;
END;
$$;


--
-- Name: fn_actualizar_estado_general(integer, character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_actualizar_estado_general(p_id_estado integer, p_nuevo_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_estado_general
    SET nombre = UPPER(TRIM(p_nuevo_nombre))
    WHERE id_estado = p_id_estado;
END;
$$;


--
-- Name: fn_actualizar_estado_lote(integer, character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_actualizar_estado_lote(p_id_estado_lote integer, p_nuevo_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_estado_lote
    SET nombre = UPPER(TRIM(p_nuevo_nombre))
    WHERE id_estado_lote = p_id_estado_lote;
END;
$$;


--
-- Name: fn_actualizar_nivel_alerta(integer, character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_actualizar_nivel_alerta(p_id_nivel_alerta integer, p_nuevo_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_nivel_alerta
    SET nombre = UPPER(TRIM(p_nuevo_nombre))
    WHERE id_nivel_alerta = p_id_nivel_alerta;
END;
$$;


--
-- Name: fn_actualizar_tipo_movimiento(integer, character varying, character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_actualizar_tipo_movimiento(p_id_tipo_movimiento integer, p_nuevo_nombre character varying, p_nueva_naturaleza character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_tipo_movimiento
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        naturaleza = UPPER(TRIM(p_nueva_naturaleza))
    WHERE id_tipo_movimiento = p_id_tipo_movimiento;
END;
$$;


--
-- Name: fn_crear_estado_aprobacion(character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_crear_estado_aprobacion(p_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO catalogos.cat_estado_aprobacion (nombre)
    VALUES (UPPER(TRIM(p_nombre)));
END;
$$;


--
-- Name: fn_crear_estado_general(character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_crear_estado_general(p_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO catalogos.cat_estado_general (nombre)
    VALUES (UPPER(TRIM(p_nombre)));
END;
$$;


--
-- Name: fn_crear_estado_lote(character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_crear_estado_lote(p_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO catalogos.cat_estado_lote (nombre)
    VALUES (UPPER(TRIM(p_nombre)));
END;
$$;


--
-- Name: fn_crear_nivel_alerta(character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_crear_nivel_alerta(p_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO catalogos.cat_nivel_alerta (nombre)
    VALUES (UPPER(TRIM(p_nombre)));
END;
$$;


--
-- Name: fn_crear_tipo_movimiento(character varying, character varying); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_crear_tipo_movimiento(p_nombre character varying, p_naturaleza character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO catalogos.cat_tipo_movimiento (nombre, naturaleza)
    VALUES (
        UPPER(TRIM(p_nombre)),
        UPPER(TRIM(p_naturaleza))
    );
END;
$$;


--
-- Name: fn_desactivar_estado_aprobacion(integer); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_desactivar_estado_aprobacion(p_id_estado_aprobacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_estado_aprobacion
    SET activo = FALSE
    WHERE id_estado_aprobacion = p_id_estado_aprobacion;
END;
$$;


--
-- Name: fn_desactivar_estado_general(integer); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_desactivar_estado_general(p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_estado_general
    SET activo = FALSE
    WHERE id_estado = p_id_estado;
END;
$$;


--
-- Name: fn_desactivar_estado_lote(integer); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_desactivar_estado_lote(p_id_estado_lote integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_estado_lote
    SET activo = FALSE
    WHERE id_estado_lote = p_id_estado_lote;
END;
$$;


--
-- Name: fn_desactivar_nivel_alerta(integer); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_desactivar_nivel_alerta(p_id_nivel_alerta integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_nivel_alerta
    SET activo = FALSE
    WHERE id_nivel_alerta = p_id_nivel_alerta;
END;
$$;


--
-- Name: fn_desactivar_tipo_movimiento(integer); Type: FUNCTION; Schema: catalogos; Owner: -
--

CREATE FUNCTION catalogos.fn_desactivar_tipo_movimiento(p_id_tipo_movimiento integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE catalogos.cat_tipo_movimiento
    SET activo = FALSE
    WHERE id_tipo_movimiento = p_id_tipo_movimiento;
END;
$$;


--
-- Name: fn_actualizar_cliente(integer, character varying, character varying, character varying, text, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_actualizar_cliente(p_id_cliente integer, p_nombre character varying, p_cedula_ruc character varying, p_telefono character varying, p_ubicacion_finca text, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE entidades.cliente
    SET nombre = p_nombre, cedula_ruc = p_cedula_ruc, telefono = p_telefono,
        ubicacion_finca = p_ubicacion_finca, id_estado = p_id_estado
    WHERE id_cliente = p_id_cliente;
END;
$$;


--
-- Name: fn_actualizar_empresa(integer, character varying, character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_actualizar_empresa(p_id_empresa integer, p_nuevo_nombre character varying, p_nueva_direccion character varying, p_nuevo_telefono character varying, p_nuevo_correo character varying, p_id_ciudad integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE entidades.empresa
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        direccion = TRIM(p_nueva_direccion),
        telefono = TRIM(p_nuevo_telefono),
        correo = LOWER(TRIM(p_nuevo_correo)),
        id_ciudad = p_id_ciudad,
        id_estado = p_id_estado
    WHERE id_empresa = p_id_empresa;
END;
$$;


--
-- Name: fn_actualizar_proveedor(integer, character varying, integer, character varying, character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_actualizar_proveedor(p_id_usuario integer, p_correo character varying, p_id_estado integer, p_ruc character varying, p_nombre_representante character varying, p_direccion character varying, p_telefono_empresa character varying, p_id_empresa integer, p_id_ciudad integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET correo = p_correo,
        id_estado = p_id_estado
    WHERE id_usuario = p_id_usuario;

    UPDATE entidades.proveedor
    SET ruc = p_ruc,
        nombre_representante = p_nombre_representante,
        direccion = p_direccion,
        telefono_empresa = p_telefono_empresa,
        id_empresa = p_id_empresa,
        id_ciudad = p_id_ciudad,
        id_estado = p_id_estado
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_proveedor(integer, integer, character varying, character varying, character varying, character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_actualizar_proveedor(p_id_proveedor integer, p_id_estado integer, p_ruc character varying, p_nombre_representante character varying, p_direccion character varying, p_telefono character varying, p_telefono_empresa character varying, p_correo_contacto character varying, p_id_empresa integer, p_id_ciudad integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_crear_cliente(character varying, character varying, character varying, text, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_crear_cliente(p_nombre character varying, p_cedula_ruc character varying, p_telefono character varying, p_ubicacion_finca text, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO entidades.cliente (nombre, cedula_ruc, telefono, ubicacion_finca, id_estado)
    VALUES (p_nombre, p_cedula_ruc, p_telefono, p_ubicacion_finca, p_id_estado);
END;
$$;


--
-- Name: fn_crear_cliente(character varying, character varying, character varying, character varying, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_crear_cliente(p_nombre_finca character varying, p_cedula character varying, p_telefono character varying, p_direccion character varying, p_id_tecnico integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO entidades.clientes(nombre_finca, cedula, telefono, direccion, id_tecnico_asignado, id_estado)
    VALUES (p_nombre_finca, p_cedula, p_telefono, p_direccion, p_id_tecnico, 1)
    RETURNING id_cliente INTO v_id;
    RETURN v_id;
END;
$$;


--
-- Name: fn_crear_empresa(character varying, character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_crear_empresa(p_nombre character varying, p_direccion character varying, p_telefono character varying, p_correo character varying, p_id_ciudad integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO entidades.empresa(
        nombre,
        direccion,
        telefono,
        correo,
        id_ciudad,
        id_estado
    )
    VALUES(
        UPPER(TRIM(p_nombre)),
        TRIM(p_direccion),
        TRIM(p_telefono),
        LOWER(TRIM(p_correo)),
        p_id_ciudad,
        p_id_estado
    );
END;
$$;


--
-- Name: fn_crear_proveedor(integer, character varying, character varying, character varying, character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_crear_proveedor(p_id_estado integer, p_ruc character varying, p_nombre_representante character varying, p_direccion character varying, p_telefono character varying, p_telefono_empresa character varying, p_correo_contacto character varying, p_id_empresa integer, p_id_ciudad integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_crear_proveedor(character varying, character varying, integer, character varying, character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_crear_proveedor(p_correo character varying, p_contrasena character varying, p_id_estado integer, p_ruc character varying, p_nombre_representante character varying, p_direccion character varying, p_telefono_empresa character varying, p_id_empresa integer, p_id_ciudad integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INTEGER;
BEGIN
    INSERT INTO seguridad.usuario (
        correo,
        contrasena,
        id_estado
    )
    VALUES (
        p_correo,
        p_contrasena,
        p_id_estado
    )
    RETURNING id_usuario INTO v_id_usuario;

    INSERT INTO entidades.proveedor (
        ruc,
        nombre_representante,
        direccion,
        telefono_empresa,
        id_empresa,
        id_ciudad,
        id_estado,
        id_usuario
    )
    VALUES (
        p_ruc,
        p_nombre_representante,
        p_direccion,
        p_telefono_empresa,
        p_id_empresa,
        p_id_ciudad,
        p_id_estado,
        v_id_usuario
    );
END;
$$;


--
-- Name: fn_desactivar_cliente(integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_desactivar_cliente(p_id_cliente integer, p_id_estado_inactivo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE entidades.cliente SET id_estado = p_id_estado_inactivo WHERE id_cliente = p_id_cliente;
END;
$$;


--
-- Name: fn_desactivar_empresa(integer, integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_desactivar_empresa(p_id_empresa integer, p_id_estado_inactivo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE entidades.empresa
    SET id_estado = p_id_estado_inactivo
    WHERE id_empresa = p_id_empresa;
END;
$$;


--
-- Name: fn_eliminar_proveedor(integer); Type: FUNCTION; Schema: entidades; Owner: -
--

CREATE FUNCTION entidades.fn_eliminar_proveedor(p_id_proveedor integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM entidades.proveedor
    WHERE id_proveedor = p_id_proveedor;
END;
$$;


--
-- Name: fn_actualizar_ciudad(integer, character varying, integer); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_actualizar_ciudad(p_id_ciudad integer, p_nuevo_nombre character varying, p_id_provincia integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE geografia.ciudad
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        id_provincia = p_id_provincia
    WHERE id_ciudad = p_id_ciudad;
END;
$$;


--
-- Name: fn_actualizar_pais(integer, character varying); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_actualizar_pais(p_id_pais integer, p_nuevo_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE geografia.pais
    SET nombre = UPPER(TRIM(p_nuevo_nombre))
    WHERE id_pais = p_id_pais;
END;
$$;


--
-- Name: fn_actualizar_provincia(integer, character varying, integer); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_actualizar_provincia(p_id_provincia integer, p_nuevo_nombre character varying, p_id_pais integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE geografia.provincia
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        id_pais = p_id_pais
    WHERE id_provincia = p_id_provincia;
END;
$$;


--
-- Name: fn_crear_ciudad(character varying, integer); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_crear_ciudad(p_nombre character varying, p_id_provincia integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO geografia.ciudad (nombre, id_provincia)
    VALUES (
        UPPER(TRIM(p_nombre)),
        p_id_provincia
    );
END;
$$;


--
-- Name: fn_crear_pais(character varying); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_crear_pais(p_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO geografia.pais (nombre)
    VALUES (UPPER(TRIM(p_nombre)));
END;
$$;


--
-- Name: fn_crear_provincia(character varying, integer); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_crear_provincia(p_nombre character varying, p_id_pais integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO geografia.provincia (nombre, id_pais)
    VALUES (
        UPPER(TRIM(p_nombre)),
        p_id_pais
    );
END;
$$;


--
-- Name: fn_desactivar_ciudad(integer); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_desactivar_ciudad(p_id_ciudad integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE geografia.ciudad
    SET activo = FALSE
    WHERE id_ciudad = p_id_ciudad;
END;
$$;


--
-- Name: fn_desactivar_pais(integer); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_desactivar_pais(p_id_pais integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE geografia.pais
    SET activo = FALSE
    WHERE id_pais = p_id_pais;
END;
$$;


--
-- Name: fn_desactivar_provincia(integer); Type: FUNCTION; Schema: geografia; Owner: -
--

CREATE FUNCTION geografia.fn_desactivar_provincia(p_id_provincia integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE geografia.provincia
    SET activo = FALSE
    WHERE id_provincia = p_id_provincia;
END;
$$;


--
-- Name: fn_actualizar_administrador(integer, character varying, integer, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: gerencia; Owner: -
--

CREATE FUNCTION gerencia.fn_actualizar_administrador(p_id_usuario integer, p_correo character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET correo = p_correo,
        id_estado = p_id_estado
    WHERE id_usuario = p_id_usuario;

    UPDATE gerencia.administrador
    SET cedula = p_cedula,
        nombres = p_nombres,
        apellidos = p_apellidos,
        telefono = p_telefono
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_gerente(integer, character varying, integer, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: gerencia; Owner: -
--

CREATE FUNCTION gerencia.fn_actualizar_gerente(p_id_usuario integer, p_correo character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET correo = p_correo,
        id_estado = p_id_estado
    WHERE id_usuario = p_id_usuario;

    UPDATE gerencia.gerente
    SET cedula = p_cedula,
        nombres = p_nombres,
        apellidos = p_apellidos,
        telefono = p_telefono
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_crear_administrador(character varying, character varying, integer, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: gerencia; Owner: -
--

CREATE FUNCTION gerencia.fn_crear_administrador(p_correo character varying, p_contrasena character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INTEGER;
BEGIN
    INSERT INTO seguridad.usuario (correo, contrasena, id_estado)
    VALUES (p_correo, p_contrasena, p_id_estado)
    RETURNING id_usuario INTO v_id_usuario;

    INSERT INTO gerencia.administrador (
        cedula, nombres, apellidos, telefono, id_usuario
    )
    VALUES (
        p_cedula, p_nombres, p_apellidos, p_telefono, v_id_usuario
    );
END;
$$;


--
-- Name: fn_crear_gerente(character varying, character varying, integer, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: gerencia; Owner: -
--

CREATE FUNCTION gerencia.fn_crear_gerente(p_correo character varying, p_contrasena character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INTEGER;
BEGIN
    INSERT INTO seguridad.usuario (correo, contrasena, id_estado)
    VALUES (p_correo, p_contrasena, p_id_estado)
    RETURNING id_usuario INTO v_id_usuario;

    INSERT INTO gerencia.gerente (
        cedula, nombres, apellidos, telefono, id_usuario
    )
    VALUES (
        p_cedula, p_nombres, p_apellidos, p_telefono, v_id_usuario
    );
END;
$$;


--
-- Name: fn_eliminar_administrador(integer); Type: FUNCTION; Schema: gerencia; Owner: -
--

CREATE FUNCTION gerencia.fn_eliminar_administrador(p_id_usuario integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM seguridad.usuario_rol
    WHERE id_usuario = p_id_usuario;

    DELETE FROM gerencia.administrador
    WHERE id_usuario = p_id_usuario;

    DELETE FROM seguridad.usuario
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_eliminar_gerente(integer); Type: FUNCTION; Schema: gerencia; Owner: -
--

CREATE FUNCTION gerencia.fn_eliminar_gerente(p_id_usuario integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM seguridad.usuario_rol
    WHERE id_usuario = p_id_usuario;

    DELETE FROM gerencia.gerente
    WHERE id_usuario = p_id_usuario;

    DELETE FROM seguridad.usuario
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_configuracion_alerta(integer, integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_actualizar_configuracion_alerta(p_id_configuracion integer, p_id_nivel_alerta integer, p_dias_anticipacion integer, p_id_usuario_modificador integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.configuracion_alertas
    SET id_nivel_alerta = p_id_nivel_alerta,
        dias_anticipacion = p_dias_anticipacion,
        id_usuario_modificador = p_id_usuario_modificador
    WHERE id_configuracion = p_id_configuracion;
    RETURN;
END;
$$;


--
-- Name: fn_actualizar_estado_sugerencia_ia(integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_actualizar_estado_sugerencia_ia(p_id_sugerencia integer, p_id_estado_aprobacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.sugerencias_ia
    SET id_estado_aprobacion = p_id_estado_aprobacion
    WHERE id_sugerencia = p_id_sugerencia;
    RETURN;
END;
$$;


--
-- Name: fn_actualizar_modelo_ia(integer, character varying, character varying, text); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_actualizar_modelo_ia(p_id_modelo integer, p_nombre_modelo character varying, p_version character varying, p_descripcion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.modelo_ia
    SET nombre_modelo = UPPER(TRIM(p_nombre_modelo)),
        version = TRIM(p_version),
        descripcion = TRIM(p_descripcion)
    WHERE id_modelo = p_id_modelo;
    RETURN;
END;
$$;


--
-- Name: fn_actualizar_promocion(integer, character varying, text, numeric, date, date, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_actualizar_promocion(p_id_promocion integer, p_nombre_promocion character varying, p_descripcion text, p_descuento_global numeric, p_fecha_inicio date, p_fecha_fin date, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.promociones
    SET nombre_promocion = UPPER(TRIM(p_nombre_promocion)),
        descripcion = TRIM(p_descripcion),
        descuento_global = p_descuento_global,
        fecha_inicio = p_fecha_inicio,
        fecha_fin = p_fecha_fin,
        id_estado = p_id_estado
    WHERE id_promocion = p_id_promocion;
    RETURN;
END;
$$;


--
-- Name: fn_actualizar_promocion_detail(integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_actualizar_promocion_detail(p_id_detalle integer, p_id_producto integer, p_cantidad_requerida integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.promocion_detalle
    SET id_producto = p_id_producto,
        cantidad_requerida = p_cantidad_requerida
    WHERE id_detalle = p_id_detalle;
    RETURN;
END;
$$;


--
-- Name: fn_actualizar_regla_negocio_ia(integer, numeric, boolean); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_actualizar_regla_negocio_ia(p_id_regla integer, p_descuento_maximo numeric, p_activar_promociones boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.regla_negocio_ia
    SET descuento_maximo_permitido = p_descuento_maximo,
        activar_promociones = p_activar_promociones
    WHERE id_regla = p_id_regla;
    RETURN;
END;
$$;


--
-- Name: fn_actualizar_temporada_agricola(integer, character varying, character varying, date, date, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_actualizar_temporada_agricola(p_id_temporada integer, p_nombre_temporada character varying, p_cultivo character varying, p_fecha_inicio date, p_fecha_fin date, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.temporadas_agricolas
    SET nombre_temporada = UPPER(TRIM(p_nombre_temporada)),
        cultivo = UPPER(TRIM(p_cultivo)),
        fecha_inicio = p_fecha_inicio,
        fecha_fin = p_fecha_fin,
        id_estado = p_id_estado
    WHERE id_temporada = p_id_temporada;
    RETURN;
END;
$$;


--
-- Name: fn_crear_alerta_caducidad(text, integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_alerta_caducidad(p_mensaje text, p_id_lote integer, p_id_nivel_alerta integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.alertas_caducidad (
        mensaje,
        id_lote,
        id_nivel_alerta,
        id_estado
    )
    VALUES (
        TRIM(p_mensaje),
        p_id_lote,
        p_id_nivel_alerta,
        p_id_estado
    );
END;
$$;


--
-- Name: fn_crear_configuracion_alerta(integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_configuracion_alerta(p_id_nivel_alerta integer, p_dias_anticipacion integer, p_id_usuario_modificador integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.configuracion_alertas (
        id_nivel_alerta,
        dias_anticipacion,
        id_usuario_modificador
    )
    VALUES (
        p_id_nivel_alerta,
        p_dias_anticipacion,
        p_id_usuario_modificador
    );
END;
$$;


--
-- Name: fn_crear_ejecucion_ia(text, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_ejecucion_ia(p_parametros_enviados text, p_id_modelo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.ejecucion_ia (
        parametros_enviados,
        id_modelo
    )
    VALUES (
        TRIM(p_parametros_enviados),
        p_id_modelo
    );
END;
$$;


--
-- Name: fn_crear_modelo_ia(character varying, character varying, text); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_modelo_ia(p_nombre_modelo character varying, p_version character varying, p_descripcion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.modelo_ia (
        nombre_modelo,
        version,
        descripcion
    )
    VALUES (
        UPPER(TRIM(p_nombre_modelo)),
        TRIM(p_version),
        TRIM(p_descripcion)
    );
END;
$$;


--
-- Name: fn_crear_notificacion(character varying, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_notificacion(p_canal character varying, p_id_alerta integer, p_id_usuario_destino integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.notificacion (
        canal,
        id_alerta,
        id_usuario_destino
    )
    VALUES (
        UPPER(TRIM(p_canal)),
        p_id_alerta,
        p_id_usuario_destino
    );
END;
$$;


--
-- Name: fn_crear_promocion(character varying, text, numeric, date, date, integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_promocion(p_nombre_promocion character varying, p_descripcion text, p_descuento_global numeric, p_fecha_inicio date, p_fecha_fin date, p_id_sugerencia integer, p_id_usuario_aprueba integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.promociones (
        nombre_promocion,
        descripcion,
        descuento_global,
        fecha_inicio,
        fecha_fin,
        id_sugerencia,
        id_usuario_aprueba,
        id_estado
    )
    VALUES (
        UPPER(TRIM(p_nombre_promocion)),
        TRIM(p_descripcion),
        p_descuento_global,
        p_fecha_inicio,
        p_fecha_fin,
        p_id_sugerencia,
        p_id_usuario_aprueba,
        p_id_estado
    );
END;
$$;


--
-- Name: fn_crear_promocion(character varying, text, numeric, date, date, integer, integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_promocion(p_nombre_promocion character varying, p_descripcion text, p_descuento_global numeric, p_fecha_inicio date, p_fecha_fin date, p_id_sugerencia integer, p_id_usuario_aprueba integer, p_id_estado integer, p_id_lote integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_crear_promocion_detalle(integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_promocion_detalle(p_id_promocion integer, p_id_producto integer, p_cantidad_requerida integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.promocion_detalle (
        id_promocion,
        id_producto,
        cantidad_requerida
    )
    VALUES (
        p_id_promocion,
        p_id_producto,
        p_cantidad_requerida
    );
END;
$$;


--
-- Name: fn_crear_regla_negocio_ia(numeric, boolean); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_regla_negocio_ia(p_descuento_maximo numeric, p_activar_promociones boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.regla_negocio_ia (
        descuento_maximo_permitido,
        activar_promociones
    )
    VALUES (
        p_descuento_maximo,
        p_activar_promociones
    );
END;
$$;


--
-- Name: fn_crear_sugerencia_ia(numeric, text, integer, integer, integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_sugerencia_ia(p_porcentaje_descuento numeric, p_observaciones text, p_id_lote integer, p_id_temporada integer, p_id_ejecucion integer, p_id_estado_aprobacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.sugerencias_ia (
        porcentaje_descuento,
        observaciones,
        id_lote,
        id_temporada,
        id_ejecucion,
        id_estado_aprobacion
    )
    VALUES (
        p_porcentaje_descuento,
        TRIM(p_observaciones),
        p_id_lote,
        p_id_temporada,
        p_id_ejecucion,
        p_id_estado_aprobacion
    );
END;
$$;


--
-- Name: fn_crear_temporada_agricola(character varying, character varying, date, date, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_crear_temporada_agricola(p_nombre_temporada character varying, p_cultivo character varying, p_fecha_inicio date, p_fecha_fin date, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ia_alertas.temporadas_agricolas (
        nombre_temporada, cultivo, fecha_inicio, fecha_fin, id_estado
    )
    VALUES (
        UPPER(TRIM(p_nombre_temporada)),
        UPPER(TRIM(p_cultivo)),
        p_fecha_inicio,
        p_fecha_fin,
        p_id_estado
    );
END;
$$;


--
-- Name: fn_desactivar_configuracion_alerta(integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_desactivar_configuracion_alerta(p_id_configuracion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.configuracion_alertas
    SET activo = FALSE
    WHERE id_configuracion = p_id_configuracion;
    RETURN;
END;
$$;


--
-- Name: fn_desactivar_modelo_ia(integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_desactivar_modelo_ia(p_id_modelo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.modelo_ia
    SET activo = FALSE
    WHERE id_modelo = p_id_modelo;
    RETURN;
END;
$$;


--
-- Name: fn_desactivar_promocion(integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_desactivar_promocion(p_id_promocion integer, p_id_estado_inactivo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.promociones
    SET id_estado = p_id_estado_inactivo
    WHERE id_promocion = p_id_promocion;
    RETURN;
END;
$$;


--
-- Name: fn_desactivar_regla_negocio_ia(integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_desactivar_regla_negocio_ia(p_id_regla integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.regla_negocio_ia
    SET activo = FALSE
    WHERE id_regla = p_id_regla;
    RETURN;
END;
$$;


--
-- Name: fn_desactivar_temporada_agricola(integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_desactivar_temporada_agricola(p_id_temporada integer, p_id_estado_inactivo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.temporadas_agricolas
    SET id_estado = p_id_estado_inactivo
    WHERE id_temporada = p_id_temporada;
    RETURN;
END;
$$;


--
-- Name: fn_descartar_alerta_caducidad(integer, integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_descartar_alerta_caducidad(p_id_alerta integer, p_id_estado_descartado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.alertas_caducidad
    SET id_estado = p_id_estado_descartado
    WHERE id_alerta = p_id_alerta;
    RETURN;
END;
$$;


--
-- Name: fn_eliminar_promocion_detalle(integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_eliminar_promocion_detalle(p_id_detalle integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM ia_alertas.promocion_detalle
    WHERE id_detalle = p_id_detalle;
    RETURN;
END;
$$;


--
-- Name: fn_registrar_lectura_notificacion(integer); Type: FUNCTION; Schema: ia_alertas; Owner: -
--

CREATE FUNCTION ia_alertas.fn_registrar_lectura_notificacion(p_id_notificacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE ia_alertas.notificacion
    SET fecha_lectura = CURRENT_TIMESTAMP
    WHERE id_notificacion = p_id_notificacion;
    RETURN;
END;
$$;


--
-- Name: fn_actualizar_almacen(integer, character varying, numeric, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_almacen(p_id_almacen integer, p_nuevo_nombre character varying, p_nueva_capacidad numeric, p_id_ciudad integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.almacen
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        capacidad_total = p_nueva_capacidad,
        id_ciudad = p_id_ciudad
    WHERE id_almacen = p_id_almacen;
END;
$$;


--
-- Name: fn_actualizar_bodeguero(integer, character varying, integer, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_bodeguero(p_id_usuario integer, p_correo character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying, p_turno character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET correo = p_correo,
        id_estado = p_id_estado
    WHERE id_usuario = p_id_usuario;

    UPDATE inventario.bodeguero
    SET cedula = p_cedula,
        nombres = p_nombres,
        apellidos = p_apellidos,
        telefono = p_telefono,
        turno = p_turno
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_categoria(integer, character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_categoria(p_id_categoria integer, p_nuevo_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.categoria
    SET nombre = UPPER(TRIM(p_nuevo_nombre))
    WHERE id_categoria = p_id_categoria;
END;
$$;


--
-- Name: fn_actualizar_documento_lote(integer, character varying, character varying, character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_documento_lote(p_id_documento integer, p_nuevo_nombre character varying, p_nueva_ruta character varying, p_nuevo_tipo character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.documentos_lote
    SET nombre_archivo = TRIM(p_nuevo_nombre),
        ruta_archivo = TRIM(p_nueva_ruta),
        tipo_documento = UPPER(TRIM(p_nuevo_tipo)),
        fecha_subida = CURRENT_TIMESTAMP
    WHERE id_documento = p_id_documento;
END;
$$;


--
-- Name: fn_actualizar_estanteria(integer, character varying, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_estanteria(p_id_estanteria integer, p_nuevo_codigo character varying, p_id_zona integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.estanteria
    SET codigo = UPPER(TRIM(p_nuevo_codigo)),
        id_zona = p_id_zona
    WHERE id_estanteria = p_id_estanteria;
END;
$$;


--
-- Name: fn_actualizar_lote(integer, date, date, integer, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_lote(p_id_lote integer, p_fecha_fabricacion date, p_fecha_vencimiento date, p_id_ubicacion integer, p_id_estado_lote integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.lotes
    SET fecha_fabricacion = p_fecha_fabricacion,
        fecha_vencimiento = p_fecha_vencimiento,
        id_ubicacion = p_id_ubicacion,
        id_estado_lote = p_id_estado_lote
    WHERE id_lote = p_id_lote;
END;
$$;


--
-- Name: fn_actualizar_producto(integer, character varying, text, character varying, numeric, integer, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_producto(p_id_producto integer, p_nuevo_nombre character varying, p_nueva_descripcion text, p_nueva_unidad_medida character varying, p_nuevo_precio numeric, p_id_categoria integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.producto
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        descripcion = TRIM(p_nueva_descripcion),
        unidad_medida = UPPER(TRIM(p_nueva_unidad_medida)),
        precio = p_nuevo_precio,
        id_categoria = p_id_categoria,
        id_estado = p_id_estado
    WHERE id_producto = p_id_producto;
END;
$$;


--
-- Name: fn_actualizar_registro_sanitario(integer, character varying, character varying, date, date, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_registro_sanitario(p_id_registro integer, p_nuevo_numero character varying, p_nuevo_organismo character varying, p_fecha_emision date, p_fecha_vigencia date, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.registro_sanitario
    SET numero_registro = UPPER(TRIM(p_nuevo_numero)),
        organismo_emisor = UPPER(TRIM(p_nuevo_organismo)),
        fecha_emision = p_fecha_emision,
        fecha_vigencia = p_fecha_vigencia,
        id_estado = p_id_estado
    WHERE id_registro = p_id_registro;
END;
$$;


--
-- Name: fn_actualizar_supervisor(integer, character varying, integer, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_supervisor(p_id_usuario integer, p_correo character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying, p_area_supervision character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET correo = p_correo,
        id_estado = p_id_estado
    WHERE id_usuario = p_id_usuario;

    UPDATE inventario.supervisor
    SET cedula = p_cedula,
        nombres = p_nombres,
        apellidos = p_apellidos,
        telefono = p_telefono,
        area_supervision = p_area_supervision
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_ubicacion_interna(integer, character varying, character varying, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_ubicacion_interna(p_id_ubicacion integer, p_nuevo_nivel character varying, p_nueva_posicion character varying, p_id_estanteria integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.ubicacion_interna
    SET nivel = UPPER(TRIM(p_nuevo_nivel)),
        posicion = UPPER(TRIM(p_nueva_posicion)),
        id_estanteria = p_id_estanteria
    WHERE id_ubicacion = p_id_ubicacion;
END;
$$;


--
-- Name: fn_actualizar_zona_almacen(integer, character varying, character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_actualizar_zona_almacen(p_id_zona integer, p_nuevo_nombre character varying, p_nueva_condicion character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.zona_almacen
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        condicion_climatica = UPPER(TRIM(p_nueva_condicion))
    WHERE id_zona = p_id_zona;
END;
$$;


--
-- Name: fn_anular_lote(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_anular_lote(p_id_lote integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.lotes
    SET activo = FALSE
    WHERE id_lote = p_id_lote;
END;
$$;


--
-- Name: fn_crear_almacen(character varying, numeric, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_almacen(p_nombre character varying, p_capacidad_total numeric, p_id_ciudad integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.almacen (
        nombre,
        capacidad_total,
        id_ciudad
    )
    VALUES (
        UPPER(TRIM(p_nombre)),
        p_capacidad_total,
        p_id_ciudad
    );
END;
$$;


--
-- Name: fn_crear_bodeguero(character varying, character varying, integer, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_bodeguero(p_correo character varying, p_contrasena character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying, p_turno character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INTEGER;
BEGIN
    INSERT INTO seguridad.usuario (correo, contrasena, id_estado)
    VALUES (p_correo, p_contrasena, p_id_estado)
    RETURNING id_usuario INTO v_id_usuario;

    INSERT INTO inventario.bodeguero (
        cedula,
        nombres,
        apellidos,
        telefono,
        turno,
        id_usuario
    )
    VALUES (
        p_cedula,
        p_nombres,
        p_apellidos,
        p_telefono,
        p_turno,
        v_id_usuario
    );
END;
$$;


--
-- Name: fn_crear_categoria(character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_categoria(p_nombre character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.categoria (nombre)
    VALUES (UPPER(TRIM(p_nombre)));
END;
$$;


--
-- Name: fn_crear_documento_lote(character varying, character varying, character varying, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_documento_lote(p_nombre_archivo character varying, p_ruta_archivo character varying, p_tipo_documento character varying, p_id_lote integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.documentos_lote (
        nombre_archivo,
        ruta_archivo,
        tipo_documento,
        id_lote
    )
    VALUES (
        TRIM(p_nombre_archivo),
        TRIM(p_ruta_archivo),
        UPPER(TRIM(p_tipo_documento)),
        p_id_lote
    );
END;
$$;


--
-- Name: fn_crear_estanteria(character varying, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_estanteria(p_codigo character varying, p_id_zona integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.estanteria (
        codigo,
        id_zona
    )
    VALUES (
        UPPER(TRIM(p_codigo)),
        p_id_zona
    );
END;
$$;


--
-- Name: fn_crear_lote(character varying, date, date, integer, integer, integer, integer, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_lote(p_numero_lote character varying, p_fecha_fabricacion date, p_fecha_vencimiento date, p_cantidad_inicial integer, p_id_producto integer, p_id_proveedor integer, p_id_ubicacion integer, p_id_estado_lote integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.lotes (
        numero_lote,
        fecha_fabricacion,
        fecha_vencimiento,
        cantidad_inicial,
        cantidad_actual,
        id_producto,
        id_proveedor,
        id_ubicacion,
        id_estado_lote
    )
    VALUES (
        UPPER(TRIM(p_numero_lote)),
        p_fecha_fabricacion,
        p_fecha_vencimiento,
        p_cantidad_inicial,
        p_cantidad_inicial,
        p_id_producto,
        p_id_proveedor,
        p_id_ubicacion,
        p_id_estado_lote
    );
END;
$$;


--
-- Name: fn_crear_producto(character varying, text, character varying, numeric, integer, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_producto(p_nombre character varying, p_descripcion text, p_unidad_medida character varying, p_precio numeric, p_id_categoria integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.producto (
        nombre,
        descripcion,
        unidad_medida,
        precio,
        id_categoria,
        id_estado
    )
    VALUES (
        UPPER(TRIM(p_nombre)),
        TRIM(p_descripcion),
        UPPER(TRIM(p_unidad_medida)),
        p_precio,
        p_id_categoria,
        p_id_estado
    );
END;
$$;


--
-- Name: fn_crear_registro_sanitario(character varying, character varying, date, date, integer, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_registro_sanitario(p_numero_registro character varying, p_organismo_emisor character varying, p_fecha_emision date, p_fecha_vigencia date, p_id_producto integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.registro_sanitario (
        numero_registro,
        organismo_emisor,
        fecha_emision,
        fecha_vigencia,
        id_producto,
        id_estado
    )
    VALUES (
        UPPER(TRIM(p_numero_registro)),
        UPPER(TRIM(p_organismo_emisor)),
        p_fecha_emision,
        p_fecha_vigencia,
        p_id_producto,
        p_id_estado
    );
END;
$$;


--
-- Name: fn_crear_supervisor(character varying, character varying, integer, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_supervisor(p_correo character varying, p_contrasena character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying, p_area_supervision character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INTEGER;
BEGIN
    INSERT INTO seguridad.usuario (correo, contrasena, id_estado)
    VALUES (p_correo, p_contrasena, p_id_estado)
    RETURNING id_usuario INTO v_id_usuario;

    INSERT INTO inventario.supervisor (
        cedula,
        nombres,
        apellidos,
        telefono,
        area_supervision,
        id_usuario
    )
    VALUES (
        p_cedula,
        p_nombres,
        p_apellidos,
        p_telefono,
        p_area_supervision,
        v_id_usuario
    );
END;
$$;


--
-- Name: fn_crear_ubicacion_interna(character varying, character varying, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_ubicacion_interna(p_nivel character varying, p_posicion character varying, p_id_estanteria integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.ubicacion_interna (
        nivel,
        posicion,
        id_estanteria
    )
    VALUES (
        UPPER(TRIM(p_nivel)),
        UPPER(TRIM(p_posicion)),
        p_id_estanteria
    );
END;
$$;


--
-- Name: fn_crear_zona_almacen(character varying, character varying, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_crear_zona_almacen(p_nombre character varying, p_condicion_climatica character varying, p_id_almacen integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO inventario.zona_almacen (
        nombre,
        condicion_climatica,
        id_almacen
    )
    VALUES (
        UPPER(TRIM(p_nombre)),
        UPPER(TRIM(p_condicion_climatica)),
        p_id_almacen
    );
END;
$$;


--
-- Name: fn_desactivar_almacen(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_desactivar_almacen(p_id_almacen integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.almacen
    SET activo = FALSE
    WHERE id_almacen = p_id_almacen;
END;
$$;


--
-- Name: fn_desactivar_categoria(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_desactivar_categoria(p_id_categoria integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.categoria
    SET activo = FALSE
    WHERE id_categoria = p_id_categoria;
END;
$$;


--
-- Name: fn_desactivar_estanteria(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_desactivar_estanteria(p_id_estanteria integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.estanteria
    SET activo = FALSE
    WHERE id_estanteria = p_id_estanteria;
END;
$$;


--
-- Name: fn_desactivar_producto(integer, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_desactivar_producto(p_id_producto integer, p_id_estado_inactivo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.producto
    SET id_estado = p_id_estado_inactivo
    WHERE id_producto = p_id_producto;
END;
$$;


--
-- Name: fn_desactivar_registro_sanitario(integer, integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_desactivar_registro_sanitario(p_id_registro integer, p_id_estado_inactivo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.registro_sanitario
    SET id_estado = p_id_estado_inactivo
    WHERE id_registro = p_id_registro;
END;
$$;


--
-- Name: fn_desactivar_ubicacion_interna(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_desactivar_ubicacion_interna(p_id_ubicacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.ubicacion_interna
    SET activo = FALSE
    WHERE id_ubicacion = p_id_ubicacion;
END;
$$;


--
-- Name: fn_desactivar_zona_almacen(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_desactivar_zona_almacen(p_id_zona integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE inventario.zona_almacen
    SET activo = FALSE
    WHERE id_zona = p_id_zona;
END;
$$;


--
-- Name: fn_eliminar_bodeguero(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_eliminar_bodeguero(p_id_usuario integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM seguridad.usuario_rol
    WHERE id_usuario = p_id_usuario;

    DELETE FROM inventario.bodeguero
    WHERE id_usuario = p_id_usuario;

    DELETE FROM seguridad.usuario
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_eliminar_documento_lote(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_eliminar_documento_lote(p_id_documento integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM inventario.documentos_lote
    WHERE id_documento = p_id_documento;
END;
$$;


--
-- Name: fn_eliminar_supervisor(integer); Type: FUNCTION; Schema: inventario; Owner: -
--

CREATE FUNCTION inventario.fn_eliminar_supervisor(p_id_usuario integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM seguridad.usuario_rol
    WHERE id_usuario = p_id_usuario;

    DELETE FROM inventario.supervisor
    WHERE id_usuario = p_id_usuario;

    DELETE FROM seguridad.usuario
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_devolucion(integer, text); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_actualizar_devolucion(p_id_devolucion integer, p_motivo text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE operaciones.devoluciones
    SET motivo = TRIM(p_motivo)
    WHERE id_devolucion = p_id_devolucion;
END;
$$;


--
-- Name: fn_actualizar_movimiento_inventario(integer, text, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_actualizar_movimiento_inventario(p_id_movimiento integer, p_observacion text, p_id_estado_aprobacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE operaciones.movimientos_inventario
    SET observacion = TRIM(p_observacion),
        id_estado_aprobacion = p_id_estado_aprobacion
    WHERE id_movimiento = p_id_movimiento;
END;
$$;


--
-- Name: fn_actualizar_tecnico(integer, character varying, integer, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_actualizar_tecnico(p_id_usuario integer, p_correo character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying, p_licencia_agricola character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET correo = p_correo,
        id_estado = p_id_estado
    WHERE id_usuario = p_id_usuario;

    UPDATE operaciones.tecnico_campo
    SET cedula = p_cedula,
        nombres = p_nombres,
        apellidos = p_apellidos,
        telefono = p_telefono,
        licencia_agricola = p_licencia_agricola
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_uso_campo(integer, character varying, character varying, date, text); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_actualizar_uso_campo(p_id_uso integer, p_parcela character varying, p_cultivo character varying, p_fecha_aplicacion date, p_observacion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE operaciones.uso_campo
    SET parcela = UPPER(TRIM(p_parcela)),
        cultivo = UPPER(TRIM(p_cultivo)),
        fecha_aplicacion = p_fecha_aplicacion,
        observacion = TRIM(p_observacion)
    WHERE id_uso = p_id_uso;
END;
$$;


--
-- Name: fn_anular_devolucion(integer, integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_anular_devolucion(p_id_devolucion integer, p_id_estado_anulado integer, p_id_estado_aprobado_ref integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_estado_actual INTEGER;
    v_id_lote INTEGER;
    v_cantidad INTEGER;
BEGIN
    SELECT id_estado_aprobacion, id_lote, cantidad
    INTO v_estado_actual, v_id_lote, v_cantidad
    FROM operaciones.devoluciones
    WHERE id_devolucion = p_id_devolucion;

    IF v_estado_actual <> p_id_estado_anulado THEN

        IF v_estado_actual = p_id_estado_aprobado_ref THEN
            UPDATE inventario.lotes
            SET cantidad_actual = cantidad_actual + v_cantidad
            WHERE id_lote = v_id_lote;
        END IF;

        UPDATE operaciones.devoluciones
        SET id_estado_aprobacion = p_id_estado_anulado
        WHERE id_devolucion = p_id_devolucion;

    END IF;
END;
$$;


--
-- Name: fn_anular_movimiento_inventario(integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_anular_movimiento_inventario(p_id_movimiento integer, p_id_estado_anulado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_estado_actual INTEGER;
    v_id_lote INTEGER;
    v_cantidad INTEGER;
    v_id_tipo_movimiento INTEGER;
    v_naturaleza VARCHAR;
BEGIN
    SELECT id_estado_aprobacion, id_lote, cantidad, id_tipo_movimiento
    INTO v_estado_actual, v_id_lote, v_cantidad, v_id_tipo_movimiento
    FROM operaciones.movimientos_inventario
    WHERE id_movimiento = p_id_movimiento;

    IF v_estado_actual <> p_id_estado_anulado THEN

        SELECT naturaleza
        INTO v_naturaleza
        FROM catalogos.cat_tipo_movimiento
        WHERE id_tipo_movimiento = v_id_tipo_movimiento;

        IF v_naturaleza = 'INGRESO' THEN

            UPDATE inventario.lotes
            SET cantidad_actual = cantidad_actual - v_cantidad
            WHERE id_lote = v_id_lote;

        ELSIF v_naturaleza IN ('SALIDA', 'AJUSTE') THEN

            UPDATE inventario.lotes
            SET cantidad_actual = cantidad_actual + v_cantidad
            WHERE id_lote = v_id_lote;

        END IF;

        UPDATE operaciones.movimientos_inventario
        SET id_estado_aprobacion = p_id_estado_anulado
        WHERE id_movimiento = p_id_movimiento;

    END IF;
END;
$$;


--
-- Name: fn_anular_uso_campo(integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_anular_uso_campo(p_id_uso integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_activo_actual BOOLEAN;
    v_id_lote INTEGER;
    v_cantidad_usada INTEGER;
BEGIN
    SELECT activo, id_lote, cantidad_used
    INTO v_activo_actual, v_id_lote, v_cantidad_usada
    FROM operaciones.uso_campo
    WHERE id_uso = p_id_uso;

    IF v_activo_actual = TRUE THEN

        UPDATE operaciones.uso_campo
        SET activo = FALSE
        WHERE id_uso = p_id_uso;

        UPDATE inventario.lotes
        SET cantidad_actual = cantidad_actual + v_cantidad_usada
        WHERE id_lote = v_id_lote;

    END IF;
END;
$$;


--
-- Name: fn_aprobar_devolucion(integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_aprobar_devolucion(p_id_devolucion integer, p_id_estado_aprobado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_estado_actual INTEGER;
    v_id_lote INTEGER;
    v_cantidad_devolver INTEGER;
BEGIN
    SELECT id_estado_aprobacion, id_lote, cantidad
    INTO v_estado_actual, v_id_lote, v_cantidad_devolver
    FROM operaciones.devoluciones
    WHERE id_devolucion = p_id_devolucion;

    IF v_estado_actual <> p_id_estado_aprobado THEN

        UPDATE operaciones.devoluciones
        SET id_estado_aprobacion = p_id_estado_aprobado
        WHERE id_devolucion = p_id_devolucion;

        UPDATE inventario.lotes
        SET cantidad_actual = cantidad_actual - v_cantidad_devolver
        WHERE id_lote = v_id_lote;

    END IF;
END;
$$;


--
-- Name: fn_crear_detalle_venta(integer, integer, integer, numeric, numeric, boolean, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_crear_detalle_venta(p_id_venta integer, p_id_lote integer, p_cantidad integer, p_precio_unitario numeric, p_subtotal_linea numeric, p_es_combo_ia boolean, p_id_promocion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_crear_devolucion(text, integer, integer, integer, integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_crear_devolucion(p_motivo text, p_cantidad integer, p_id_lote integer, p_id_proveedor integer, p_id_usuario_supervisor integer, p_id_estado_aprobacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO operaciones.devoluciones (
        motivo, cantidad, id_lote, id_proveedor,
        id_usuario_supervisor, id_estado_aprobacion
    )
    VALUES (
        TRIM(p_motivo),
        p_cantidad,
        p_id_lote,
        p_id_proveedor,
        p_id_usuario_supervisor,
        p_id_estado_aprobacion
    );
END;
$$;


--
-- Name: fn_crear_movimiento_inventario(integer, text, integer, integer, integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_crear_movimiento_inventario(p_cantidad integer, p_observacion text, p_id_lote integer, p_id_tipo_movimiento integer, p_id_usuario integer, p_id_estado_aprobacion integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_naturaleza VARCHAR;
BEGIN
    INSERT INTO operaciones.movimientos_inventario (
        cantidad, observacion, id_lote, id_tipo_movimiento, id_usuario, id_estado_aprobacion
    )
    VALUES (
        p_cantidad, TRIM(p_observacion), p_id_lote, p_id_tipo_movimiento,
        p_id_usuario, p_id_estado_aprobacion
    );

    SELECT naturaleza
    INTO v_naturaleza
    FROM catalogos.cat_tipo_movimiento
    WHERE id_tipo_movimiento = p_id_tipo_movimiento;

    IF v_naturaleza = 'INGRESO' THEN
        UPDATE inventario.lotes
        SET cantidad_actual = cantidad_actual + p_cantidad
        WHERE id_lote = p_id_lote;

    ELSIF v_naturaleza IN ('SALIDA', 'AJUSTE') THEN
        UPDATE inventario.lotes
        SET cantidad_actual = cantidad_actual - p_cantidad
        WHERE id_lote = p_id_lote;
    END IF;
END;
$$;


--
-- Name: fn_crear_orden_pedido(integer, character varying, integer, integer, text, integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_crear_orden_pedido(p_id_cliente integer, p_descripcion_plaga character varying, p_id_lote integer, p_cantidad integer, p_observacion text, p_id_usuario_tecnico integer, p_id_combo_aplicado integer DEFAULT NULL::integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_crear_tecnico(character varying, character varying, integer, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_crear_tecnico(p_correo character varying, p_contrasena character varying, p_id_estado integer, p_cedula character varying, p_nombres character varying, p_apellidos character varying, p_telefono character varying, p_licencia_agricola character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_usuario INTEGER;
BEGIN
    INSERT INTO seguridad.usuario (correo, contrasena, id_estado)
    VALUES (p_correo, p_contrasena, p_id_estado)
    RETURNING id_usuario INTO v_id_usuario;

    INSERT INTO operaciones.tecnico_campo (
        cedula,
        nombres,
        apellidos,
        telefono,
        licencia_agricola,
        id_usuario
    )
    VALUES (
        p_cedula,
        p_nombres,
        p_apellidos,
        p_telefono,
        p_licencia_agricola,
        v_id_usuario
    );
END;
$$;


--
-- Name: fn_crear_uso_campo(character varying, character varying, date, integer, text, integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_crear_uso_campo(p_parcela character varying, p_cultivo character varying, p_fecha_aplicacion date, p_cantidad_usada integer, p_observacion text, p_id_lote integer, p_id_usuario_tecnico integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO operaciones.uso_campo (
        parcela, cultivo, fecha_aplicacion, cantidad_usada,
        observacion, id_lote, id_usuario_tecnico
    )
    VALUES (
        UPPER(TRIM(p_parcela)),
        UPPER(TRIM(p_cultivo)),
        p_fecha_aplicacion,
        p_cantidad_usada,
        TRIM(p_observacion),
        p_id_lote,
        p_id_usuario_tecnico
    );

    UPDATE inventario.lotes
    SET cantidad_actual = cantidad_actual - p_cantidad_usada
    WHERE id_lote = p_id_lote;
END;
$$;


--
-- Name: fn_crear_venta(character varying, integer, integer, numeric, numeric, numeric, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_crear_venta(p_numero_orden character varying, p_id_cliente integer, p_id_tecnico integer, p_subtotal numeric, p_descuento_total numeric, p_total numeric, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO operaciones.venta (numero_orden, fecha_venta, id_cliente, id_tecnico, subtotal, descuento_total, total, id_estado)
    VALUES (p_numero_orden, NOW(), p_id_cliente, p_id_tecnico, p_subtotal, p_descuento_total, p_total, p_id_estado);
END;
$$;


--
-- Name: fn_despachar_pedido(integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_despachar_pedido(p_id_uso integer, p_id_usuario integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_devolucion_cliente(integer, text, integer, integer, integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_devolucion_cliente(p_id_pedido_original integer, p_motivo text, p_cantidad integer, p_id_lote integer, p_id_usuario integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: fn_eliminar_tecnico(integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_eliminar_tecnico(p_id_usuario integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM seguridad.usuario_rol
    WHERE id_usuario = p_id_usuario;

    DELETE FROM operaciones.tecnico_campo
    WHERE id_usuario = p_id_usuario;

    DELETE FROM seguridad.usuario
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_entregar_pedido(integer); Type: FUNCTION; Schema: operaciones; Owner: -
--

CREATE FUNCTION operaciones.fn_entregar_pedido(p_id_uso integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_estado_pedido INTEGER;
BEGIN
    SELECT id_estado_pedido INTO v_id_estado_pedido
    FROM operaciones.uso_campo
    WHERE id_uso = p_id_uso AND tipo_registro = 'ORDEN_PEDIDO';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden de pedido no encontrada con ID: %', p_id_uso;
    END IF;

    IF v_id_estado_pedido != 2 THEN
        RAISE EXCEPTION 'El pedido % no está en estado DESPACHADO.', p_id_uso;
    END IF;

    UPDATE operaciones.uso_campo
    SET id_estado_pedido = 3
    WHERE id_uso = p_id_uso;
END;
$$;


--
-- Name: gen_detalle_compra(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.gen_detalle_compra(IN p_total integer, IN p_batch integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ins INT := 0;
    v_oc INT[]; v_prod INT[];
BEGIN
    SELECT array_agg(id) INTO v_oc FROM operaciones.orden_compra;
    SELECT array_agg(id_producto) INTO v_prod FROM inventario.producto;
    
    IF v_oc IS NULL THEN RAISE EXCEPTION 'No hay ordenes. Corre gen_orden_compra primero.'; END IF;
    
    WHILE v_ins < p_total LOOP
        INSERT INTO operaciones.detalle_compra
            (id_orden_compra, id_producto, cantidad, precio_unitario,
             porcentaje_descuento, valor_descuento, subtotal, es_bonificacion)
        SELECT
            v_oc[1 + floor(random()*array_length(v_oc,1))::int],
            v_prod[1 + floor(random()*array_length(v_prod,1))::int],
            c.cantidad, c.precio, c.pdesc,
            round(c.cantidad * c.precio * c.pdesc / 100.0, 2),
            round(c.cantidad * c.precio * (1 - c.pdesc/100.0), 2),
            (random() < 0.08)  -- ~8% bonificaciones
        FROM generate_series(1, p_batch) g
        CROSS JOIN LATERAL (
            SELECT (floor(random()*100)+1)::int AS cantidad,
                   round((random()*195+5)::numeric,2) AS precio,
                   round((random()*15)::numeric,2) AS pdesc
        ) c;
        
        v_ins := v_ins + p_batch;
        COMMIT;
        RAISE NOTICE 'detalle_compra generados: % / %', v_ins, p_total;
    END LOOP;
END $$;


--
-- Name: gen_detalle_ventas(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.gen_detalle_ventas(IN p_total integer, IN p_batch integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ins INT := 0;
    v_v INT[]; v_lotes INT[]; v_promos INT[];
BEGIN
    SELECT array_agg(id) INTO v_v FROM operaciones.ventas;
    SELECT array_agg(id_lote) INTO v_lotes FROM inventario.lotes;
    
    -- Manejo seguro si no existe la tabla promociones
    IF to_regclass('ia_alertas.promociones') IS NOT NULL THEN
        SELECT array_agg(id_promocion) INTO v_promos FROM ia_alertas.promociones;
    END IF;

    IF v_v IS NULL THEN RAISE EXCEPTION 'No hay ventas. Corre gen_ventas primero.'; END IF;
    
    WHILE v_ins < p_total LOOP
        INSERT INTO operaciones.detalle_ventas
            (id_venta, id_producto, id_lote, cantidad, precio_unitario, subtotal, es_sugerencia_ia, id_promocion)
        SELECT
            v_v[1 + floor(random()*array_length(v_v,1))::int],
            lo.id_producto, -- Se obtiene de la tabla lotes, garantizando consistencia
            r.rid_lote,
            d.cantidad, d.precio, round(d.cantidad*d.precio,2),
            d.es_ia,
            CASE WHEN d.es_ia AND v_promos IS NOT NULL THEN v_promos[1 + floor(random()*array_length(v_promos,1))::int] ELSE NULL END
        FROM generate_series(1, p_batch) g
        CROSS JOIN LATERAL (
            SELECT v_lotes[1 + floor(random()*array_length(v_lotes,1))::int] AS rid_lote
        ) r
        JOIN inventario.lotes lo ON lo.id_lote = r.rid_lote
        CROSS JOIN LATERAL (
            SELECT (floor(random()*30)+1)::int AS cantidad,
                   round((random()*195+5)::numeric,2) AS precio,
                   (random() < 0.25) AS es_ia
        ) d;
        
        v_ins := v_ins + p_batch;
        COMMIT;
        RAISE NOTICE 'detalle_ventas generados: % / %', v_ins, p_total;
    END LOOP;
END $$;


--
-- Name: gen_devoluciones(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.gen_devoluciones(IN p_total integer, IN p_batch integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ins INT := 0;
    v_lote INT[]; v_prov INT[]; v_supervisores INT[];
BEGIN
    SELECT array_agg(id_lote) INTO v_lote FROM inventario.lotes;
    SELECT array_agg(id_proveedor) INTO v_prov FROM entidades.proveedor;
    SELECT array_agg(id_usuario) INTO v_supervisores FROM seguridad.usuario WHERE id_usuario IN (31, 32);
    
    WHILE v_ins < p_total LOOP
        INSERT INTO operaciones.devoluciones
            (fecha_devolucion, motivo, cantidad, id_lote, id_proveedor,
             id_usuario_supervisor, id_estado_aprobacion)
        SELECT
            COALESCE(lo.fecha_ingreso, now() - interval '400 days') + (floor(random()*60)+1 || ' days')::interval,
            (ARRAY['Producto vencido','Empaque dañado','Cantidad incorrecta','Producto no solicitado','Falla calidad'])[floor(random()*5)+1],
            (floor(random()*50)+1)::int,
            lo.id_lote,
            v_prov[1 + floor(random()*array_length(v_prov,1))::int],
            v_supervisores[1 + floor(random()*array_length(v_supervisores,1))::int],
            (ARRAY[1,1,2,3])[floor(random()*4)+1]
        FROM generate_series(1, p_batch) g
        CROSS JOIN LATERAL (SELECT v_lote[1 + floor(random()*array_length(v_lote,1))::int] AS rid) r
        JOIN inventario.lotes lo ON lo.id_lote = r.rid;
        
        v_ins := v_ins + p_batch;
        COMMIT;
        RAISE NOTICE 'devoluciones a proveedor generadas: % / %', v_ins, p_total;
    END LOOP;
END $$;


--
-- Name: gen_devoluciones_venta(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.gen_devoluciones_venta(IN p_total integer, IN p_batch integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ins INT := 0;
    v_v INT[]; v_lote INT[];
BEGIN
    SELECT array_agg(id) INTO v_v FROM operaciones.ventas;
    SELECT array_agg(id_lote) INTO v_lote FROM inventario.lotes;
    
    IF v_v IS NULL THEN RAISE EXCEPTION 'No hay ventas. Corre gen_ventas primero.'; END IF;
    
    WHILE v_ins < p_total LOOP
        INSERT INTO operaciones.devoluciones_venta
            (id_venta, id_producto, cantidad_devuelta, motivo, fecha_solicitud,
             estado_logistico, estado_inventario, id_lote) -- <-- id_lote añadido aquí
        SELECT
            v.id, 
            lo.id_producto,
            (floor(random()*10)+1)::int,
            (ARRAY['Producto vencido','Empaque roto','Error en pedido','Cliente insatisfecho','Duplicado'])[floor(random()*5)+1],
            base.f_sol,
            base.est_log,
            CASE WHEN base.est_log = 'RECIBIDA_BODEGA' THEN (ARRAY['REINTEGRADO','MERMA'])[floor(random()*2)+1] ELSE NULL END,
            lo.id_lote -- <-- Asignando el id_lote real
        FROM generate_series(1, p_batch) g
        CROSS JOIN LATERAL (
            SELECT v_v[1 + floor(random()*array_length(v_v,1))::int] AS rid,
                   v_lote[1 + floor(random()*array_length(v_lote,1))::int] AS id_lote
        ) r
        JOIN operaciones.ventas v ON v.id = r.rid
        JOIN inventario.lotes lo ON lo.id_lote = r.id_lote
        CROSS JOIN LATERAL (
            SELECT v.fecha + (floor(random()*15)+1 || ' days')::interval AS f_sol,
                   (ARRAY['SOLICITADA','EN_TRANSITO','RECIBIDA_BODEGA','RECIBIDA_BODEGA'])[floor(random()*4)+1] AS est_log
        ) base;
        
        v_ins := v_ins + p_batch;
        COMMIT;
        RAISE NOTICE 'devoluciones de venta generadas: % / %', v_ins, p_total;
    END LOOP;
END $$;


--
-- Name: gen_movimientos(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.gen_movimientos(IN p_total integer, IN p_batch integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ins INT := 0;
    v_lote INT[]; v_tipomov INT[]; v_bodegueros INT[];
BEGIN
    SELECT array_agg(id_lote) INTO v_lote FROM inventario.lotes;
    SELECT array_agg(id_tipo_movimiento) INTO v_tipomov FROM catalogos.cat_tipo_movimiento;
    SELECT array_agg(id_usuario) INTO v_bodegueros FROM seguridad.usuario WHERE id_usuario IN (33, 34);
    
    WHILE v_ins < p_total LOOP
        INSERT INTO operaciones.movimientos_inventario
            (fecha_movimiento, cantidad, observacion, id_lote,
             id_tipo_movimiento, id_usuario, id_estado_aprobacion)
        SELECT
            COALESCE(lo.fecha_ingreso, now() - interval '400 days') + (floor(random()*300) || ' days')::interval,
            (floor(random()*200)+1)::int,
            (ARRAY['Ingreso por compra','Salida por venta','Ajuste físico','Traslado bodegas','Merma','Devolución a proveedor'])[floor(random()*6)+1],
            lo.id_lote,
            v_tipomov[1 + floor(random()*array_length(v_tipomov,1))::int],
            v_bodegueros[1 + floor(random()*array_length(v_bodegueros,1))::int],
            (ARRAY[1,1,1,2,3])[floor(random()*5)+1]
        FROM generate_series(1, p_batch) g
        CROSS JOIN LATERAL (SELECT v_lote[1 + floor(random()*array_length(v_lote,1))::int] AS rid) r
        JOIN inventario.lotes lo ON lo.id_lote = r.rid;
        
        v_ins := v_ins + p_batch;
        COMMIT;
        RAISE NOTICE 'movimientos_inventario generados: % / %', v_ins, p_total;
    END LOOP;
END $$;


--
-- Name: gen_orden_compra(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.gen_orden_compra(IN p_total integer, IN p_batch integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ins INT := 0;
    v_prov INT[];
    v_supervisores INT[];
BEGIN
    SELECT array_agg(id_proveedor) INTO v_prov FROM entidades.proveedor;
    SELECT array_agg(id_usuario) INTO v_supervisores FROM seguridad.usuario WHERE id_usuario IN (31, 32);
    
    WHILE v_ins < p_total LOOP
        INSERT INTO operaciones.orden_compra
            (id_proveedor, numero_factura, fecha_emision, subtotal_bruto,
             total_descuentos, costo_transporte, impuestos, total_neto,
             estado, fecha_registro, id_usuario_registro,
             fecha_llegada_estimada, ventana_horaria, fecha_llegada_real,
             estado_cumplimiento, observacion_retraso)
        SELECT
            v_prov[1 + floor(random()*array_length(v_prov,1))::int],
            'FAC-' || (v_ins+g) || '-' || floor(random()*99999)::int,
            base.fecha,
            base.subtotal, base.desc_, base.transporte,
            round((base.subtotal - base.desc_) * 0.15, 2),
            round((base.subtotal - base.desc_) * 1.15 + base.transporte, 2),
            base.estado,
            now(),
            v_supervisores[1 + floor(random()*array_length(v_supervisores,1))::int],
            cump.llegada_est,
            (ARRAY['08:00 - 10:00','10:00 - 12:00','14:00 - 16:00','16:00 - 18:00'])[floor(random()*4)+1],
            cump.llegada_real,
            cump.estado_cump,
            CASE WHEN cump.estado_cump = 'RETRASADO' THEN (ARRAY['Retraso transportista','Problema aduana','Falta stock','Clima adverso'])[floor(random()*4)+1] ELSE NULL END
        FROM generate_series(1, p_batch) g
        CROSS JOIN LATERAL (
            SELECT (CURRENT_DATE - (floor(random()*730))::int)::date AS fecha,
                   (ARRAY['PENDIENTE','RECEPCIONADA','RECEPCIONADA','RECEPCIONADA','ANULADA'])[floor(random()*5)+1] AS estado,
                   round((random()*4000+100)::numeric,2) AS subtotal,
                   round((random()*200)::numeric,2) AS desc_,
                   round((random()*200)::numeric,2) AS transporte
        ) base
        CROSS JOIN LATERAL (
            SELECT 
                CASE WHEN base.estado = 'RECEPCIONADA' THEN (ARRAY['A_TIEMPO','A_TIEMPO','A_TIEMPO','RETRASADO'])[floor(random()*4)+1]
                     WHEN base.estado = 'PENDIENTE' THEN 'PENDIENTE' ELSE 'NO_ENTREGADO' END AS estado_cump,
                base.fecha + (floor(random()*10)+1)::int AS llegada_est
        ) cump2
        CROSS JOIN LATERAL (
            SELECT cump2.estado_cump, cump2.llegada_est,
                   CASE WHEN cump2.estado_cump IN ('A_TIEMPO', 'RETRASADO') THEN 
                        cump2.llegada_est::TIMESTAMP + (CASE WHEN cump2.estado_cump = 'RETRASADO' THEN (floor(random()*5)+1) ELSE 0 END || ' days')::INTERVAL
                   ELSE NULL END AS llegada_real
        ) cump;

        v_ins := v_ins + p_batch;
        COMMIT;
        RAISE NOTICE 'orden_compra generadas: % / %', v_ins, p_total;
    END LOOP;
END $$;


--
-- Name: gen_ventas(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.gen_ventas(IN p_total integer, IN p_batch integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ins INT := 0;
    v_cli INT[]; v_tecnicos INT[];
BEGIN
    SELECT array_agg(id_cliente) INTO v_cli FROM entidades.clientes;
    SELECT array_agg(id_usuario) INTO v_tecnicos FROM seguridad.usuario WHERE id_usuario IN (35, 36);
    
    WHILE v_ins < p_total LOOP
        INSERT INTO operaciones.ventas
            (id_cliente, id_tecnico, numero_comprobante, fecha, subtotal,
             iva_aplicado, total, estado, descuento_total, costo_envio, 
             metodo_pago, referencia_pago, fecha_estimada_entrega, ventana_horaria)
        SELECT
            v_cli[1 + floor(random()*array_length(v_cli,1))::int],
            v_tecnicos[1 + floor(random()*array_length(v_tecnicos,1))::int],
            -- CORRECCIÓN 1: Formato seguro de 13 caracteres (ej: VTA-000005234)
            'VTA-' || LPAD((v_ins+g)::TEXT, 9, '0'),
            f.fecha,
            f.subtotal,
            round((f.subtotal - f.desc_) * 0.15, 2),
            round((f.subtotal - f.desc_) * 1.15 + f.envio, 2),
            -- CORRECCIÓN 2: Se acortó a 'DEVUELTA_PARCIAL' (16 caracteres) para evitar error de VARCHAR(20)
            (ARRAY['CONFIRMADA','PREPARADA','ENTREGADA','ENTREGADA','ENTREGADA','DEVUELTA_PARCIAL'])[floor(random()*6)+1],
            f.desc_,
            f.envio,
            (ARRAY['EFECTIVO','TRANSFERENCIA','CREDITO','TARJETA'])[floor(random()*4)+1],
            'REF-' || LPAD((floor(random()*999999))::int::text, 6, '0'),
            (f.fecha + (floor(random()*7)+1 || ' days')::interval)::date,
            (ARRAY['08:00 - 10:00','10:00 - 12:00','14:00 - 16:00','16:00 - 18:00'])[floor(random()*4)+1]
        FROM generate_series(1, p_batch) g
        CROSS JOIN LATERAL (
            SELECT (now() - (floor(random()*730) || ' days')::interval) AS fecha,
                   round((random()*300+10)::numeric,2) AS subtotal,
                   round((random()*15)::numeric,2) AS desc_,
                   round((random()*50)::numeric,2) AS envio
        ) f;
        
        v_ins := v_ins + p_batch;
        COMMIT;
        RAISE NOTICE 'ventas generadas: % / %', v_ins, p_total;
    END LOOP;
END $$;


--
-- Name: generar_devoluciones(integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.generar_devoluciones(IN p_cantidad integer DEFAULT 80000)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_lotes        INT[];
    v_proveedores  INT[];
    v_supervisores INT[];
    i INT;
BEGIN
    SELECT array_agg(id_lote)      INTO v_lotes        FROM inventario.lotes;
    SELECT array_agg(id_proveedor) INTO v_proveedores FROM entidades.proveedor;
    SELECT array_agg(id_usuario)   INTO v_supervisores FROM seguridad.usuario WHERE id_usuario IN (31, 32);

    IF v_supervisores IS NULL THEN
        RAISE EXCEPTION 'No existen los usuarios supervisores 31/32 en seguridad.usuario';
    END IF;

    FOR i IN 1..p_cantidad LOOP
        INSERT INTO operaciones.devoluciones (
            id_lote, id_proveedor, id_usuario_supervisor, motivo, cantidad, fecha_devolucion, id_estado_aprobacion
        ) VALUES (
            v_lotes[1 + floor(random() * array_length(v_lotes,1))::INT],
            v_proveedores[1 + floor(random() * array_length(v_proveedores,1))::INT],
            v_supervisores[1 + floor(random() * array_length(v_supervisores,1))::INT],
            (ARRAY['Producto vencido','Empaque dañado','Cantidad incorrecta','Producto no solicitado','Falla de calidad'])[1 + floor(random() * 5)::INT],
            1 + floor(random() * 50)::INT,
            NOW() - (floor(random() * 730) || ' days')::INTERVAL,
            (ARRAY[1,1,2,3])[1 + floor(random() * 4)::INT]
        );

        IF i % 50000 = 0 THEN
            RAISE NOTICE 'Devoluciones a proveedor generadas: %', i;
            COMMIT;
        END IF;
    END LOOP;

    RAISE NOTICE 'OK — % devoluciones a proveedor generadas exitosamente', p_cantidad;
END $$;


--
-- Name: generar_devoluciones_venta(integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.generar_devoluciones_venta(IN p_cantidad integer DEFAULT 70000)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ventas   INT[];
    v_id_venta INT;
    v_id_prod  INT;
    v_fecha    TIMESTAMP;
    v_estado   TEXT;
    i INT;
BEGIN
    SELECT array_agg(id) INTO v_ventas FROM operaciones.ventas;

    IF v_ventas IS NULL THEN
        RAISE EXCEPTION 'No hay ventas. Ejecutá generar_ventas() antes que esta función.';
    END IF;

    FOR i IN 1..p_cantidad LOOP
        v_id_venta := v_ventas[1 + floor(random() * array_length(v_ventas,1))::INT];

        SELECT id_producto INTO v_id_prod
          FROM operaciones.detalle_ventas
         WHERE id_venta = v_id_venta
         LIMIT 1;

        CONTINUE WHEN v_id_prod IS NULL;

        v_fecha  := NOW() - (floor(random() * 700) || ' days')::INTERVAL;
        v_estado := (ARRAY['SOLICITADA','EN_TRANSITO','RECIBIDA_BODEGA','RECIBIDA_BODEGA'])[1 + floor(random() * 4)::INT];

        INSERT INTO operaciones.devoluciones_venta (
            id_venta, id_producto, cantidad_devuelta, motivo, fecha_solicitud, estado_logistico, estado_inventario, fecha_recepcion
        ) VALUES (
            v_id_venta, v_id_prod,
            1 + floor(random() * 10)::INT,
            (ARRAY['Producto vencido','Empaque roto','Error en el pedido','Cliente insatisfecho','Producto duplicado'])[1 + floor(random() * 5)::INT],
            v_fecha, v_estado,
            CASE WHEN v_estado = 'RECIBIDA_BODEGA' THEN (ARRAY['REINTEGRADO','MERMA'])[1 + floor(random() * 2)::INT] ELSE NULL END,
            CASE WHEN v_estado = 'RECIBIDA_BODEGA' THEN v_fecha + (1 + floor(random() * 5) || ' days')::INTERVAL ELSE NULL END
        );

        IF i % 50000 = 0 THEN
            RAISE NOTICE 'Devoluciones de venta generadas: %', i;
            COMMIT;
        END IF;
    END LOOP;

    RAISE NOTICE 'OK — % devoluciones de venta generadas exitosamente', p_cantidad;
END $$;


--
-- Name: generar_movimientos(integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.generar_movimientos(IN p_cantidad integer DEFAULT 400000)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_lotes      INT[];
    v_tipos      INT[];
    v_bodegueros INT[];
    i INT;
BEGIN
    SELECT array_agg(id_lote)            INTO v_lotes FROM inventario.lotes;
    SELECT array_agg(id_tipo_movimiento) INTO v_tipos FROM catalogos.cat_tipo_movimiento;
    SELECT array_agg(id_usuario)         INTO v_bodegueros FROM seguridad.usuario WHERE id_usuario IN (33, 34);

    IF v_bodegueros IS NULL THEN
        RAISE EXCEPTION 'No existen los usuarios bodegueros 33/34 en seguridad.usuario';
    END IF;

    FOR i IN 1..p_cantidad LOOP
        INSERT INTO operaciones.movimientos_inventario (
            id_lote, id_tipo_movimiento, id_usuario, cantidad, observacion, fecha_movimiento, id_estado_aprobacion
        ) VALUES (
            v_lotes[1 + floor(random() * array_length(v_lotes,1))::INT],
            v_tipos[1 + floor(random() * array_length(v_tipos,1))::INT],
            v_bodegueros[1 + floor(random() * array_length(v_bodegueros,1))::INT],
            1 + floor(random() * 200)::INT,
            (ARRAY['Ingreso por compra','Salida por venta','Ajuste por inventario físico','Traslado entre bodegas','Merma detectada','Devolución a proveedor'])[1 + floor(random() * 6)::INT],
            NOW() - (floor(random() * 730) || ' days')::INTERVAL,
            (ARRAY[1,1,1,2,3])[1 + floor(random() * 5)::INT]
        );

        IF i % 50000 = 0 THEN
            RAISE NOTICE 'Movimientos generados: %', i;
            COMMIT;
        END IF;
    END LOOP;

    RAISE NOTICE 'OK — % movimientos generados exitosamente', p_cantidad;
END $$;


--
-- Name: generar_ordenes_compra(integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.generar_ordenes_compra(IN p_cantidad integer DEFAULT 150000)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_proveedores INT[];
    v_productos   INT[];
    v_supervisores INT[];
    v_id_orden    INT;
    v_fecha       DATE;
    v_subtotal    NUMERIC(10,2);
    v_desc        NUMERIC(10,2);
    v_transporte  NUMERIC(10,2);
    v_impuestos   NUMERIC(10,2);
    v_estado      TEXT;
    v_cumplimiento TEXT;
    v_llegada_est DATE;
    v_llegada_real TIMESTAMP;
    v_lineas      INT;
    v_cant        INT;
    v_precio      NUMERIC(10,2);
    v_sub_linea   NUMERIC(10,2);
    v_pct_desc    NUMERIC(5,2);
    i INT; j INT;
BEGIN
    SELECT array_agg(id_proveedor) INTO v_proveedores FROM entidades.proveedor;
    SELECT array_agg(id_producto)  INTO v_productos   FROM inventario.producto;
    SELECT array_agg(id_usuario)   INTO v_supervisores FROM seguridad.usuario WHERE id_usuario IN (31, 32);

    IF v_supervisores IS NULL THEN
        RAISE EXCEPTION 'No existen los usuarios supervisores 31/32 en seguridad.usuario';
    END IF;

    FOR i IN 1..p_cantidad LOOP
        v_fecha      := CURRENT_DATE - (floor(random() * 730))::INT;
        v_transporte := round((random() * 200)::NUMERIC, 2);
        v_estado     := (ARRAY['PENDIENTE','RECEPCIONADA','RECEPCIONADA','RECEPCIONADA','ANULADA'])[1 + floor(random() * 5)::INT];

        IF v_estado = 'RECEPCIONADA' THEN
            v_cumplimiento := (ARRAY['A_TIEMPO','A_TIEMPO','A_TIEMPO','RETRASADO'])[1 + floor(random() * 4)::INT];
            v_llegada_est  := v_fecha + (1 + floor(random() * 10))::INT;
            v_llegada_real := v_llegada_est::TIMESTAMP + (CASE WHEN v_cumplimiento = 'RETRASADO' THEN (1 + floor(random() * 5))::INT ELSE 0 END || ' days')::INTERVAL;
        ELSIF v_estado = 'PENDIENTE' THEN
            v_cumplimiento := 'PENDIENTE';
            v_llegada_est  := v_fecha + (1 + floor(random() * 10))::INT;
            v_llegada_real := NULL;
        ELSE
            v_cumplimiento := 'NO_ENTREGADO';
            v_llegada_est  := v_fecha + (1 + floor(random() * 10))::INT;
            v_llegada_real := NULL;
        END IF;

        INSERT INTO operaciones.orden_compra (
            id_proveedor, numero_factura, fecha_emision, subtotal_bruto, total_descuentos, costo_transporte, impuestos, total_neto,
            estado, fecha_registro, id_usuario_registro, fecha_llegada_estimada, ventana_horaria, fecha_llegada_real,
            estado_cumplimiento, observacion_retraso
        ) VALUES (
            v_proveedores[1 + floor(random() * array_length(v_proveedores,1))::INT],
            'FAC-' || LPAD(i::TEXT, 9, '0'), v_fecha, 0, 0, v_transporte, 0, 0, v_estado,
            v_fecha::TIMESTAMP + (floor(random() * 12) || ' hours')::INTERVAL,
            v_supervisores[1 + floor(random() * array_length(v_supervisores,1))::INT],
            v_llegada_est, (ARRAY['08:00 - 10:00','10:00 - 12:00','14:00 - 16:00','16:00 - 18:00'])[1 + floor(random() * 4)::INT],
            v_llegada_real, v_cumplimiento,
            CASE WHEN v_cumplimiento = 'RETRASADO' THEN (ARRAY['Retraso del transportista','Problema en aduana','Falta de stock del proveedor','Clima adverso'])[1 + floor(random() * 4)::INT] ELSE NULL END
        ) RETURNING id INTO v_id_orden;

        v_lineas   := 1 + floor(random() * 5)::INT;
        v_subtotal := 0;
        v_desc     := 0;

        FOR j IN 1..v_lineas LOOP
            v_cant      := 1 + floor(random() * 100)::INT;
            v_precio    := round((5 + random() * 195)::NUMERIC, 2);
            v_pct_desc  := round((random() * 15)::NUMERIC, 2);
            v_sub_linea := round(v_cant * v_precio, 2);

            INSERT INTO operaciones.detalle_compra (
                id_orden_compra, id_producto, cantidad, precio_unitario, porcentaje_descuento, valor_descuento, subtotal, es_bonificacion
            ) VALUES (
                v_id_orden, v_productos[1 + floor(random() * array_length(v_productos,1))::INT],
                v_cant, v_precio, v_pct_desc, round(v_sub_linea * v_pct_desc / 100, 2),
                round(v_sub_linea - (v_sub_linea * v_pct_desc / 100), 2), (random() < 0.08)
            );

            v_subtotal := v_subtotal + v_sub_linea;
            v_desc     := v_desc + round(v_sub_linea * v_pct_desc / 100, 2);
        END LOOP;

        v_impuestos := round((v_subtotal - v_desc) * 0.15, 2);

        UPDATE operaciones.orden_compra
           SET subtotal_bruto = v_subtotal, total_descuentos = v_desc, impuestos = v_impuestos, total_neto = v_subtotal - v_desc + v_impuestos + v_transporte
         WHERE id = v_id_orden;

        IF i % 50000 = 0 THEN
            RAISE NOTICE 'Órdenes de compra generadas: %', i;
            COMMIT;
        END IF;
    END LOOP;

    RAISE NOTICE 'OK — % órdenes de compra generadas exitosamente', p_cantidad;
END $$;


--
-- Name: generar_ventas(integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.generar_ventas(IN p_cantidad integer DEFAULT 200000)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_clientes INT[];
    v_tecnicos INT[];
    v_lotes    INT[];
    v_promos   INT[];
    v_id_venta INT;
    v_fecha    TIMESTAMP;
    v_subtotal NUMERIC(10,2);
    v_desc     NUMERIC(10,2);
    v_iva      NUMERIC(10,2);
    v_envio    NUMERIC(10,2);
    v_lineas   INT;
    v_cant     INT;
    v_precio   NUMERIC(10,2);
    v_sub_linea NUMERIC(10,2);
    v_id_lote  INT;
    v_id_prod  INT;
    v_es_ia    BOOLEAN;
    v_id_promo INT;
    i INT; j INT;
BEGIN
    SELECT array_agg(id_cliente) INTO v_clientes FROM entidades.clientes;
    SELECT array_agg(id_usuario) INTO v_tecnicos FROM seguridad.usuario WHERE id_usuario IN (35, 36);
    SELECT array_agg(id_lote)    INTO v_lotes    FROM inventario.lotes;
    SELECT array_agg(id_promocion) INTO v_promos FROM ia_alertas.promociones;

    IF v_tecnicos IS NULL THEN
        RAISE EXCEPTION 'No existen los usuarios técnicos 35/36 en seguridad.usuario';
    END IF;

    FOR i IN 1..p_cantidad LOOP
        v_fecha := NOW() - (floor(random() * 730) || ' days')::INTERVAL - (floor(random() * 24) || ' hours')::INTERVAL;
        v_envio := round((random() * 50)::NUMERIC, 2);

        INSERT INTO operaciones.ventas (
            id_cliente, id_tecnico, numero_comprobante, fecha, subtotal, iva_aplicado, total, estado,
            descuento_total, costo_envio, metodo_pago, referencia_pago, fecha_estimada_entrega, ventana_horaria
        ) VALUES (
            v_clientes[1 + floor(random() * array_length(v_clientes,1))::INT],
            v_tecnicos[1 + floor(random() * array_length(v_tecnicos,1))::INT],
            'VTA-' || LPAD(i::TEXT, 9, '0'), v_fecha, 0, 0, 0,
            (ARRAY['CONFIRMADA','PREPARADA','ENTREGADA','ENTREGADA','ENTREGADA','DEVUELTA_PARCIALMENTE'])[1 + floor(random() * 6)::INT],
            0, v_envio,
            (ARRAY['EFECTIVO','TRANSFERENCIA','CREDITO','TARJETA'])[1 + floor(random() * 4)::INT],
            'REF-' || LPAD((floor(random() * 999999))::INT::TEXT, 6, '0'),
            (v_fecha + (1 + floor(random() * 7) || ' days')::INTERVAL)::DATE,
            (ARRAY['08:00 - 10:00','10:00 - 12:00','14:00 - 16:00','16:00 - 18:00'])[1 + floor(random() * 4)::INT]
        ) RETURNING id INTO v_id_venta;

        v_lineas   := 1 + floor(random() * 4)::INT;
        v_subtotal := 0;
        v_desc     := 0;

        FOR j IN 1..v_lineas LOOP
            v_id_lote := v_lotes[1 + floor(random() * array_length(v_lotes,1))::INT];
            SELECT id_producto INTO v_id_prod FROM inventario.lotes WHERE id_lote = v_id_lote;

            v_cant      := 1 + floor(random() * 30)::INT;
            v_precio    := round((5 + random() * 195)::NUMERIC, 2);
            v_sub_linea := round(v_cant * v_precio, 2);
            v_es_ia     := (random() < 0.25);
            v_id_promo  := CASE WHEN v_es_ia AND v_promos IS NOT NULL THEN v_promos[1 + floor(random() * array_length(v_promos,1))::INT] ELSE NULL END;

            INSERT INTO operaciones.detalle_ventas (
                id_venta, id_producto, id_lote, cantidad, precio_unitario, subtotal, es_sugerencia_ia, id_promocion
            ) VALUES (
                v_id_venta, v_id_prod, v_id_lote, v_cant, v_precio, v_sub_linea, v_es_ia, v_id_promo
            );

            v_subtotal := v_subtotal + v_sub_linea;
            IF v_es_ia THEN
                v_desc := v_desc + round(v_sub_linea * 0.10, 2);
            END IF;
        END LOOP;

        v_iva := round((v_subtotal - v_desc) * 0.15, 2);

        UPDATE operaciones.ventas
           SET subtotal = v_subtotal, descuento_total = v_desc, iva_aplicado = v_iva, total = v_subtotal - v_desc + v_iva + v_envio
         WHERE id = v_id_venta;

        IF i % 50000 = 0 THEN
            RAISE NOTICE 'Ventas generadas: %', i;
            COMMIT;
        END IF;
    END LOOP;

    RAISE NOTICE 'OK — % ventas generadas exitosamente', p_cantidad;
END $$;


--
-- Name: fn_actualizar_contrasena(integer, character varying); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_actualizar_contrasena(p_id_usuario integer, p_nueva_contrasena character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET contrasena = p_nueva_contrasena
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_actualizar_privilegio(integer, character varying, character varying, integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_actualizar_privilegio(p_id_privilegio integer, p_nuevo_nombre character varying, p_nueva_accion character varying, p_id_tipo_objeto integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.privilegio
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        accion = UPPER(TRIM(p_nueva_accion)),
        id_tipo_objeto = p_id_tipo_objeto
    WHERE id_privilegio = p_id_privilegio;
END;
$$;


--
-- Name: fn_actualizar_rol_bd(integer, character varying, text); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_actualizar_rol_bd(p_id_rol_bd integer, p_nuevo_nombre_rol_bd character varying, p_nueva_descripcion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.rol_bd
    SET nombre_rol_bd = LOWER(TRIM(p_nuevo_nombre_rol_bd)),
        descripcion = TRIM(p_nueva_descripcion)
    WHERE id_rol_bd = p_id_rol_bd;
END;
$$;


--
-- Name: fn_actualizar_tipo_objeto_seguridad(integer, character varying, text); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_actualizar_tipo_objeto_seguridad(p_id_tipo_objeto integer, p_nuevo_nombre character varying, p_nueva_descripcion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.tipo_objeto_seguridad
    SET nombre = UPPER(TRIM(p_nuevo_nombre)),
        descripcion = TRIM(p_nueva_descripcion)
    WHERE id_tipo_objeto = p_id_tipo_objeto;
END;
$$;


--
-- Name: fn_asignar_privilegio_rol(integer, integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_asignar_privilegio_rol(p_id_rol integer, p_id_privilegio integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguridad.rol_privilegio(id_rol,id_privilegio)
    VALUES(p_id_rol,p_id_privilegio)
    ON CONFLICT(id_rol,id_privilegio) DO NOTHING;
END;
$$;


--
-- Name: fn_asignar_rol_usuario(integer, integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_asignar_rol_usuario(p_id_usuario integer, p_id_rol integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguridad.usuario_rol (id_usuario, id_rol)
    VALUES (p_id_usuario, p_id_rol)
    ON CONFLICT (id_usuario, id_rol) DO NOTHING;
END;
$$;


--
-- Name: fn_crear_privilegio(character varying, character varying, integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_crear_privilegio(p_nombre character varying, p_accion character varying, p_id_tipo_objeto integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguridad.privilegio(nombre, accion, id_tipo_objeto)
    VALUES (
        UPPER(TRIM(p_nombre)),
        UPPER(TRIM(p_accion)),
        p_id_tipo_objeto
    );
END;
$$;


--
-- Name: fn_crear_rol(character varying, integer, integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_crear_rol(p_nombre character varying, p_id_rol_bd integer, p_id_estado integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguridad.rol (nombre, id_rol_bd, id_estado)
    VALUES (p_nombre, p_id_rol_bd, p_id_estado);
END;
$$;


--
-- Name: fn_crear_rol_bd(character varying, text); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_crear_rol_bd(p_nombre_rol_bd character varying, p_descripcion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguridad.rol_bd (nombre_rol_bd, descripcion)
    VALUES (LOWER(TRIM(p_nombre_rol_bd)), TRIM(p_descripcion));
END;
$$;


--
-- Name: fn_crear_tipo_objeto_seguridad(character varying, text); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_crear_tipo_objeto_seguridad(p_nombre character varying, p_descripcion text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguridad.tipo_objeto_seguridad(nombre, descripcion)
    VALUES (UPPER(TRIM(p_nombre)), TRIM(p_descripcion));
END;
$$;


--
-- Name: fn_desactivar_privilegio(integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_desactivar_privilegio(p_id_privilegio integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.privilegio
    SET activo = FALSE
    WHERE id_privilegio = p_id_privilegio;
END;
$$;


--
-- Name: fn_desactivar_rol_bd(integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_desactivar_rol_bd(p_id_rol_bd integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.rol_bd
    SET activo = FALSE
    WHERE id_rol_bd = p_id_rol_bd;
END;
$$;


--
-- Name: fn_desactivar_tipo_objeto_seguridad(integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_desactivar_tipo_objeto_seguridad(p_id_tipo_objeto integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.tipo_objeto_seguridad
    SET activo = FALSE
    WHERE id_tipo_objeto = p_id_tipo_objeto;
END;
$$;


--
-- Name: fn_eliminacion_logica_usuario(integer, integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_eliminacion_logica_usuario(p_id_usuario integer, p_id_estado_inactivo integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE seguridad.usuario
    SET id_estado = p_id_estado_inactivo
    WHERE id_usuario = p_id_usuario;

    UPDATE entidades.proveedor
    SET id_estado = p_id_estado_inactivo
    WHERE id_usuario = p_id_usuario;
END;
$$;


--
-- Name: fn_revocar_privilegio_rol(integer, integer); Type: FUNCTION; Schema: seguridad; Owner: -
--

CREATE FUNCTION seguridad.fn_revocar_privilegio_rol(p_id_rol integer, p_id_privilegio integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM seguridad.rol_privilegio
    WHERE id_rol = p_id_rol
      AND id_privilegio = p_id_privilegio;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cat_cultivo; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_cultivo (
    id_cultivo integer NOT NULL,
    nombre character varying(150) NOT NULL,
    id_estado integer
);


--
-- Name: cat_cultivo_id_cultivo_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_cultivo ALTER COLUMN id_cultivo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.cat_cultivo_id_cultivo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cat_estado_alerta; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_estado_alerta (
    id_estado_alerta integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_estado_alerta_id_estado_alerta_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

CREATE SEQUENCE catalogos.cat_estado_alerta_id_estado_alerta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cat_estado_alerta_id_estado_alerta_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: -
--

ALTER SEQUENCE catalogos.cat_estado_alerta_id_estado_alerta_seq OWNED BY catalogos.cat_estado_alerta.id_estado_alerta;


--
-- Name: cat_estado_aprobacion; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_estado_aprobacion (
    id_estado_aprobacion integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_estado_aprobacion_id_estado_aprobacion_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_estado_aprobacion ALTER COLUMN id_estado_aprobacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.cat_estado_aprobacion_id_estado_aprobacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cat_estado_general; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_estado_general (
    id_estado integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_estado_general_id_estado_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_estado_general ALTER COLUMN id_estado ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.cat_estado_general_id_estado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cat_estado_lote; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_estado_lote (
    id_estado_lote integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_estado_lote_id_estado_lote_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_estado_lote ALTER COLUMN id_estado_lote ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.cat_estado_lote_id_estado_lote_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cat_estado_promocion; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_estado_promocion (
    id_estado_promocion integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_estado_promocion_id_estado_promocion_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

CREATE SEQUENCE catalogos.cat_estado_promocion_id_estado_promocion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cat_estado_promocion_id_estado_promocion_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: -
--

ALTER SEQUENCE catalogos.cat_estado_promocion_id_estado_promocion_seq OWNED BY catalogos.cat_estado_promocion.id_estado_promocion;


--
-- Name: cat_estado_temporada; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_estado_temporada (
    id_estado_temporada integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_estado_temporada_id_estado_temporada_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

CREATE SEQUENCE catalogos.cat_estado_temporada_id_estado_temporada_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cat_estado_temporada_id_estado_temporada_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: -
--

ALTER SEQUENCE catalogos.cat_estado_temporada_id_estado_temporada_seq OWNED BY catalogos.cat_estado_temporada.id_estado_temporada;


--
-- Name: cat_estado_venta; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_estado_venta (
    id_estado_venta integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_estado_venta_id_estado_venta_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

CREATE SEQUENCE catalogos.cat_estado_venta_id_estado_venta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cat_estado_venta_id_estado_venta_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: -
--

ALTER SEQUENCE catalogos.cat_estado_venta_id_estado_venta_seq OWNED BY catalogos.cat_estado_venta.id_estado_venta;


--
-- Name: cat_nivel_alerta; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_nivel_alerta (
    id_nivel_alerta integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_nivel_alerta_id_nivel_alerta_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_nivel_alerta ALTER COLUMN id_nivel_alerta ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.cat_nivel_alerta_id_nivel_alerta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cat_plaga; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_plaga (
    id_plaga integer NOT NULL,
    nombre character varying(150) NOT NULL,
    id_estado integer
);


--
-- Name: cat_plaga_id_plaga_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_plaga ALTER COLUMN id_plaga ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.cat_plaga_id_plaga_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cat_tipo_movimiento; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.cat_tipo_movimiento (
    id_tipo_movimiento integer NOT NULL,
    nombre character varying(100) NOT NULL,
    naturaleza character varying(50) NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: cat_tipo_movimiento_id_tipo_movimiento_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_tipo_movimiento ALTER COLUMN id_tipo_movimiento ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME catalogos.cat_tipo_movimiento_id_tipo_movimiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: formulacion; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.formulacion (
    id_formulacion integer NOT NULL,
    sigla character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255)
);


--
-- Name: formulacion_id_formulacion_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

CREATE SEQUENCE catalogos.formulacion_id_formulacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: formulacion_id_formulacion_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: -
--

ALTER SEQUENCE catalogos.formulacion_id_formulacion_seq OWNED BY catalogos.formulacion.id_formulacion;


--
-- Name: toxicidad; Type: TABLE; Schema: catalogos; Owner: -
--

CREATE TABLE catalogos.toxicidad (
    id_toxicidad integer NOT NULL,
    nombre character varying(100) NOT NULL,
    color_etiqueta character varying(50),
    descripcion character varying(255)
);


--
-- Name: toxicidad_id_toxicidad_seq; Type: SEQUENCE; Schema: catalogos; Owner: -
--

CREATE SEQUENCE catalogos.toxicidad_id_toxicidad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: toxicidad_id_toxicidad_seq; Type: SEQUENCE OWNED BY; Schema: catalogos; Owner: -
--

ALTER SEQUENCE catalogos.toxicidad_id_toxicidad_seq OWNED BY catalogos.toxicidad.id_toxicidad;


--
-- Name: cliente; Type: TABLE; Schema: entidades; Owner: -
--

CREATE TABLE entidades.cliente (
    id_cliente integer NOT NULL,
    nombre character varying(200) NOT NULL,
    cedula_ruc character varying(20),
    telefono character varying(30),
    ubicacion_finca text,
    id_estado integer
);


--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE; Schema: entidades; Owner: -
--

CREATE SEQUENCE entidades.cliente_id_cliente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE OWNED BY; Schema: entidades; Owner: -
--

ALTER SEQUENCE entidades.cliente_id_cliente_seq OWNED BY entidades.cliente.id_cliente;


--
-- Name: clientes; Type: TABLE; Schema: entidades; Owner: -
--

CREATE TABLE entidades.clientes (
    id_cliente integer NOT NULL,
    nombre_finca character varying(200) NOT NULL,
    cedula character varying(13) NOT NULL,
    telefono character varying(30),
    direccion character varying(300),
    id_estado integer DEFAULT 1,
    id_tecnico_asignado integer
);


--
-- Name: TABLE clientes; Type: COMMENT; Schema: entidades; Owner: -
--

COMMENT ON TABLE entidades.clientes IS 'Clientes/Fincas que compran agroquímicos. Relacionados con el técnico que los atiende.';


--
-- Name: COLUMN clientes.cedula; Type: COMMENT; Schema: entidades; Owner: -
--

COMMENT ON COLUMN entidades.clientes.cedula IS 'Cédula de identidad del dueño de la finca (10 dígitos Ecuador)';


--
-- Name: clientes_id_cliente_seq; Type: SEQUENCE; Schema: entidades; Owner: -
--

CREATE SEQUENCE entidades.clientes_id_cliente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clientes_id_cliente_seq; Type: SEQUENCE OWNED BY; Schema: entidades; Owner: -
--

ALTER SEQUENCE entidades.clientes_id_cliente_seq OWNED BY entidades.clientes.id_cliente;


--
-- Name: empresa; Type: TABLE; Schema: entidades; Owner: -
--

CREATE TABLE entidades.empresa (
    id_empresa integer NOT NULL,
    nombre character varying(200) NOT NULL,
    direccion character varying(300) NOT NULL,
    telefono character varying(30) NOT NULL,
    correo character varying(150) NOT NULL,
    id_ciudad integer NOT NULL,
    id_estado integer NOT NULL,
    ruc character varying(20)
);


--
-- Name: empresa_id_empresa_seq; Type: SEQUENCE; Schema: entidades; Owner: -
--

ALTER TABLE entidades.empresa ALTER COLUMN id_empresa ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME entidades.empresa_id_empresa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: proveedor; Type: TABLE; Schema: entidades; Owner: -
--

CREATE TABLE entidades.proveedor (
    id_proveedor integer NOT NULL,
    ruc character varying(20) NOT NULL,
    nombre_representante character varying(255) NOT NULL,
    direccion character varying(300) NOT NULL,
    telefono_empresa character varying(15) NOT NULL,
    id_empresa integer NOT NULL,
    id_ciudad integer NOT NULL,
    id_estado integer NOT NULL,
    telefono character varying(30),
    correo_contacto character varying(150)
);


--
-- Name: proveedor_id_proveedor_seq; Type: SEQUENCE; Schema: entidades; Owner: -
--

ALTER TABLE entidades.proveedor ALTER COLUMN id_proveedor ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME entidades.proveedor_id_proveedor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: proveedor_producto; Type: TABLE; Schema: entidades; Owner: -
--

CREATE TABLE entidades.proveedor_producto (
    id_proveedor_producto integer NOT NULL,
    id_proveedor integer NOT NULL,
    id_producto integer NOT NULL,
    precio_referencial numeric(10,2),
    codigo_producto_proveedor character varying(50),
    id_estado integer DEFAULT 1 NOT NULL
);


--
-- Name: proveedor_producto_id_proveedor_producto_seq; Type: SEQUENCE; Schema: entidades; Owner: -
--

CREATE SEQUENCE entidades.proveedor_producto_id_proveedor_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proveedor_producto_id_proveedor_producto_seq; Type: SEQUENCE OWNED BY; Schema: entidades; Owner: -
--

ALTER SEQUENCE entidades.proveedor_producto_id_proveedor_producto_seq OWNED BY entidades.proveedor_producto.id_proveedor_producto;


--
-- Name: ciudad; Type: TABLE; Schema: geografia; Owner: -
--

CREATE TABLE geografia.ciudad (
    id_ciudad integer NOT NULL,
    nombre character varying(150) NOT NULL,
    id_provincia integer NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: ciudad_id_ciudad_seq; Type: SEQUENCE; Schema: geografia; Owner: -
--

ALTER TABLE geografia.ciudad ALTER COLUMN id_ciudad ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME geografia.ciudad_id_ciudad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pais; Type: TABLE; Schema: geografia; Owner: -
--

CREATE TABLE geografia.pais (
    id_pais integer NOT NULL,
    nombre character varying(150) NOT NULL,
    activo boolean DEFAULT true,
    codigo_iso character varying(10)
);


--
-- Name: pais_id_pais_seq; Type: SEQUENCE; Schema: geografia; Owner: -
--

ALTER TABLE geografia.pais ALTER COLUMN id_pais ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME geografia.pais_id_pais_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: provincia; Type: TABLE; Schema: geografia; Owner: -
--

CREATE TABLE geografia.provincia (
    id_provincia integer NOT NULL,
    nombre character varying(150) NOT NULL,
    id_pais integer NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: provincia_id_provincia_seq; Type: SEQUENCE; Schema: geografia; Owner: -
--

ALTER TABLE geografia.provincia ALTER COLUMN id_provincia ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME geografia.provincia_id_provincia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: administrador; Type: TABLE; Schema: gerencia; Owner: -
--

CREATE TABLE gerencia.administrador (
    id_administrador integer NOT NULL,
    cedula character varying(20) NOT NULL,
    nombres character varying(150) NOT NULL,
    apellidos character varying(150) NOT NULL,
    telefono character varying(30),
    id_usuario integer NOT NULL
);


--
-- Name: administrador_id_administrador_seq; Type: SEQUENCE; Schema: gerencia; Owner: -
--

ALTER TABLE gerencia.administrador ALTER COLUMN id_administrador ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME gerencia.administrador_id_administrador_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: alertas_caducidad; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.alertas_caducidad (
    id_alerta integer NOT NULL,
    fecha_generada timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    mensaje text NOT NULL,
    id_lote integer NOT NULL,
    id_nivel_alerta integer NOT NULL,
    id_estado integer NOT NULL,
    fecha_generacion timestamp(6) without time zone
);


--
-- Name: alertas_caducidad_id_alerta_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.alertas_caducidad ALTER COLUMN id_alerta ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.alertas_caducidad_id_alerta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracion_alertas; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.configuracion_alertas (
    id_configuracion integer NOT NULL,
    id_nivel_alerta integer NOT NULL,
    dias_anticipacion integer NOT NULL,
    id_usuario_modificador integer NOT NULL,
    activo boolean DEFAULT true,
    CONSTRAINT configuracion_alertas_dias_anticipacion_check CHECK ((dias_anticipacion > 0))
);


--
-- Name: configuracion_alertas_id_configuracion_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.configuracion_alertas ALTER COLUMN id_configuracion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.configuracion_alertas_id_configuracion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ejecucion_ia; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.ejecucion_ia (
    id_ejecucion integer NOT NULL,
    fecha_ejecucion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    parametros_enviados text,
    id_modelo integer NOT NULL,
    id_estado integer
);


--
-- Name: ejecucion_ia_id_ejecucion_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.ejecucion_ia ALTER COLUMN id_ejecucion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.ejecucion_ia_id_ejecucion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modelo_ia; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.modelo_ia (
    id_modelo integer NOT NULL,
    nombre_modelo character varying(200) NOT NULL,
    version character varying(50) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);


--
-- Name: modelo_ia_id_modelo_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.modelo_ia ALTER COLUMN id_modelo ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.modelo_ia_id_modelo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notificacion; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.notificacion (
    id_notificacion integer NOT NULL,
    canal character varying(50) NOT NULL,
    fecha_envio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura timestamp without time zone,
    id_alerta integer NOT NULL,
    id_usuario_destino integer NOT NULL,
    leida boolean
);


--
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.notificacion ALTER COLUMN id_notificacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.notificacion_id_notificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: promocion_detalle; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.promocion_detalle (
    id_detalle integer NOT NULL,
    id_promocion integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad_requerida integer DEFAULT 1
);


--
-- Name: promocion_detalle_id_detalle_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.promocion_detalle ALTER COLUMN id_detalle ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.promocion_detalle_id_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: promociones; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.promociones (
    id_promocion integer NOT NULL,
    nombre_promocion character varying(200) NOT NULL,
    descripcion text,
    descuento_global numeric(5,2) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    id_sugerencia integer,
    id_usuario_aprueba integer NOT NULL,
    id_estado integer NOT NULL,
    id_lote integer,
    CONSTRAINT promociones_check CHECK ((fecha_fin > fecha_inicio))
);


--
-- Name: promociones_id_promocion_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.promociones ALTER COLUMN id_promocion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.promociones_id_promocion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: regla_negocio_ia; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.regla_negocio_ia (
    id_regla integer NOT NULL,
    descuento_maximo_permitido numeric(5,2) NOT NULL,
    activar_promociones boolean DEFAULT true,
    activo boolean DEFAULT true,
    descuento_maximo numeric(5,2),
    dias_alerta_anticipada integer DEFAULT 60
);


--
-- Name: regla_negocio_ia_id_regla_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.regla_negocio_ia ALTER COLUMN id_regla ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.regla_negocio_ia_id_regla_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sugerencias_ia; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.sugerencias_ia (
    id_sugerencia integer NOT NULL,
    porcentaje_descuento numeric(5,2) NOT NULL,
    observaciones text NOT NULL,
    id_lote integer NOT NULL,
    id_temporada integer NOT NULL,
    id_ejecucion integer NOT NULL,
    id_estado_aprobacion integer NOT NULL,
    fecha_sugerencia timestamp(6) without time zone
);


--
-- Name: sugerencias_ia_id_sugerencia_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.sugerencias_ia ALTER COLUMN id_sugerencia ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.sugerencias_ia_id_sugerencia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: temporadas_agricolas; Type: TABLE; Schema: ia_alertas; Owner: -
--

CREATE TABLE ia_alertas.temporadas_agricolas (
    id_temporada integer NOT NULL,
    nombre_temporada character varying(150) NOT NULL,
    cultivo character varying(150) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    id_estado integer NOT NULL,
    id_cultivo integer,
    CONSTRAINT temporadas_agricolas_check CHECK ((fecha_fin > fecha_inicio))
);


--
-- Name: temporadas_agricolas_id_temporada_seq; Type: SEQUENCE; Schema: ia_alertas; Owner: -
--

ALTER TABLE ia_alertas.temporadas_agricolas ALTER COLUMN id_temporada ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME ia_alertas.temporadas_agricolas_id_temporada_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: almacen; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.almacen (
    id_almacen integer NOT NULL,
    nombre character varying(200) NOT NULL,
    capacidad_total numeric(12,2) NOT NULL,
    id_ciudad integer NOT NULL,
    activo boolean DEFAULT true,
    id_estado integer,
    id_supervisor integer,
    direccion character varying(300)
);


--
-- Name: almacen_id_almacen_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.almacen ALTER COLUMN id_almacen ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.almacen_id_almacen_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bodeguero; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.bodeguero (
    id_bodeguero integer NOT NULL,
    cedula character varying(20) NOT NULL,
    nombres character varying(150) NOT NULL,
    apellidos character varying(150) NOT NULL,
    telefono character varying(30),
    turno character varying(50),
    id_usuario integer NOT NULL,
    id_estado integer
);


--
-- Name: bodeguero_id_bodeguero_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.bodeguero ALTER COLUMN id_bodeguero ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.bodeguero_id_bodeguero_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categoria; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.categoria (
    id_categoria integer NOT NULL,
    nombre character varying(150) NOT NULL,
    activo boolean DEFAULT true,
    id_estado integer
);


--
-- Name: categoria_id_categoria_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.categoria ALTER COLUMN id_categoria ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.categoria_id_categoria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documentos_lote; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.documentos_lote (
    id_documento integer NOT NULL,
    nombre_archivo character varying(200) NOT NULL,
    ruta_archivo character varying(500) NOT NULL,
    tipo_documento character varying(100) NOT NULL,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_lote integer NOT NULL
);


--
-- Name: documentos_lote_id_documento_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.documentos_lote ALTER COLUMN id_documento ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.documentos_lote_id_documento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estanteria; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.estanteria (
    id_estanteria integer NOT NULL,
    codigo character varying(50) NOT NULL,
    id_zona integer NOT NULL,
    activo boolean DEFAULT true,
    id_estado integer
);


--
-- Name: estanteria_id_estanteria_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.estanteria ALTER COLUMN id_estanteria ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.estanteria_id_estanteria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: historial_estado_lote; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.historial_estado_lote (
    id_historial integer NOT NULL,
    id_lote integer NOT NULL,
    id_estado_anterior integer,
    id_estado_nuevo integer NOT NULL,
    fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer NOT NULL,
    motivo text,
    observacion text
);


--
-- Name: historial_estado_lote_id_historial_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.historial_estado_lote ALTER COLUMN id_historial ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.historial_estado_lote_id_historial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lotes; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.lotes (
    id_lote integer NOT NULL,
    numero_lote character varying(100) NOT NULL,
    fecha_fabricacion date NOT NULL,
    fecha_vencimiento date NOT NULL,
    cantidad_inicial integer NOT NULL,
    cantidad_actual integer NOT NULL,
    id_producto integer NOT NULL,
    id_proveedor integer NOT NULL,
    id_ubicacion integer,
    id_estado_lote integer NOT NULL,
    activo boolean DEFAULT true,
    fecha_ingreso timestamp(6) without time zone,
    cantidad_reservada integer DEFAULT 0,
    costo_unitario_real numeric(10,2),
    id_orden_compra integer,
    id_almacen integer,
    CONSTRAINT lotes_cantidad_actual_check CHECK ((cantidad_actual >= 0)),
    CONSTRAINT lotes_cantidad_inicial_check CHECK ((cantidad_inicial > 0))
);


--
-- Name: COLUMN lotes.cantidad_reservada; Type: COMMENT; Schema: inventario; Owner: -
--

COMMENT ON COLUMN inventario.lotes.cantidad_reservada IS 'Stock reservado por pedidos pendientes. Stock disponible real = cantidad_actual - cantidad_reservada.';


--
-- Name: COLUMN lotes.costo_unitario_real; Type: COMMENT; Schema: inventario; Owner: -
--

COMMENT ON COLUMN inventario.lotes.costo_unitario_real IS 'Costo real promedio del producto en este lote. Si la compra incluye bonificaciones (regalos), el costo se distribuye entre todas las unidades. Ej: 100 productos a $10 + 10 regalados = $9.09 c/u.';


--
-- Name: COLUMN lotes.id_orden_compra; Type: COMMENT; Schema: inventario; Owner: -
--

COMMENT ON COLUMN inventario.lotes.id_orden_compra IS 'Referencia a la orden de compra que originó este lote. Permite trazabilidad financiera completa.';


--
-- Name: lotes_id_lote_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.lotes ALTER COLUMN id_lote ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.lotes_id_lote_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: producto; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.producto (
    id_producto integer NOT NULL,
    nombre character varying(200) NOT NULL,
    descripcion text NOT NULL,
    unidad_medida character varying(50) NOT NULL,
    precio numeric(10,2) NOT NULL,
    id_categoria integer NOT NULL,
    id_estado integer NOT NULL,
    stock_minimo integer DEFAULT 10,
    ingrediente_activo character varying(200),
    periodo_carencia_dias integer,
    id_toxicidad integer,
    id_formulacion integer,
    instrucciones_aplicacion text,
    aplica_iva boolean DEFAULT true NOT NULL,
    porcentaje_iva numeric(5,2) DEFAULT 15.00 NOT NULL,
    CONSTRAINT ck_producto_iva_coherente CHECK ((((aplica_iva = true) AND (porcentaje_iva >= (0)::numeric) AND (porcentaje_iva <= (100)::numeric)) OR ((aplica_iva = false) AND (porcentaje_iva = (0)::numeric)))),
    CONSTRAINT producto_precio_check CHECK ((precio >= (0)::numeric))
);


--
-- Name: COLUMN producto.stock_minimo; Type: COMMENT; Schema: inventario; Owner: -
--

COMMENT ON COLUMN inventario.producto.stock_minimo IS 'Cantidad mínima aceptable en inventario. Si el stock total cae por debajo, se genera alerta de reabastecimiento.';


--
-- Name: COLUMN producto.aplica_iva; Type: COMMENT; Schema: inventario; Owner: -
--

COMMENT ON COLUMN inventario.producto.aplica_iva IS 'Indica si el producto está gravado con IVA. Los agroquímicos e insumos agrícolas básicos suelen estar exentos en Ecuador.';


--
-- Name: COLUMN producto.porcentaje_iva; Type: COMMENT; Schema: inventario; Owner: -
--

COMMENT ON COLUMN inventario.producto.porcentaje_iva IS 'Porcentaje de IVA aplicable. Configurable por producto porque la tarifa cambia por normativa. Se ignora cuando aplica_iva = FALSE.';


--
-- Name: producto_cultivo; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.producto_cultivo (
    id_producto integer NOT NULL,
    id_cultivo integer NOT NULL
);


--
-- Name: producto_id_producto_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.producto ALTER COLUMN id_producto ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.producto_id_producto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: producto_plaga; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.producto_plaga (
    id_producto integer NOT NULL,
    id_plaga integer NOT NULL
);


--
-- Name: registro_sanitario; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.registro_sanitario (
    id_registro integer NOT NULL,
    numero_registro character varying(100) NOT NULL,
    organismo_emisor character varying(200) NOT NULL,
    fecha_emision date NOT NULL,
    fecha_vigencia date NOT NULL,
    id_producto integer NOT NULL,
    id_estado integer NOT NULL,
    CONSTRAINT registro_sanitario_check CHECK ((fecha_vigencia > fecha_emision))
);


--
-- Name: registro_sanitario_id_registro_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.registro_sanitario ALTER COLUMN id_registro ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.registro_sanitario_id_registro_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: supervisor; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.supervisor (
    id_supervisor integer NOT NULL,
    cedula character varying(20) NOT NULL,
    nombres character varying(150) NOT NULL,
    apellidos character varying(150) NOT NULL,
    telefono character varying(30),
    area_supervision character varying(150),
    id_usuario integer NOT NULL,
    id_estado integer
);


--
-- Name: supervisor_id_supervisor_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.supervisor ALTER COLUMN id_supervisor ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.supervisor_id_supervisor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ubicacion_interna; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.ubicacion_interna (
    id_ubicacion integer NOT NULL,
    nivel character varying(50) NOT NULL,
    posicion character varying(50) NOT NULL,
    id_estanteria integer NOT NULL,
    activo boolean DEFAULT true,
    id_estado integer,
    capacidad_maxima integer,
    capacidad_actual integer,
    codigo_qr character varying(100)
);


--
-- Name: ubicacion_interna_id_ubicacion_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.ubicacion_interna ALTER COLUMN id_ubicacion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.ubicacion_interna_id_ubicacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: zona_almacen; Type: TABLE; Schema: inventario; Owner: -
--

CREATE TABLE inventario.zona_almacen (
    id_zona integer NOT NULL,
    nombre character varying(150) NOT NULL,
    condicion_climatica character varying(100),
    id_almacen integer NOT NULL,
    activo boolean DEFAULT true,
    id_estado integer
);


--
-- Name: zona_almacen_id_zona_seq; Type: SEQUENCE; Schema: inventario; Owner: -
--

ALTER TABLE inventario.zona_almacen ALTER COLUMN id_zona ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME inventario.zona_almacen_id_zona_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: detalle_compra; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.detalle_compra (
    id integer NOT NULL,
    id_orden_compra integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) DEFAULT 0.00 NOT NULL,
    porcentaje_descuento numeric(5,2) DEFAULT 0.00,
    valor_descuento numeric(10,2) DEFAULT 0.00,
    subtotal numeric(10,2) DEFAULT 0.00,
    es_bonificacion boolean DEFAULT false,
    CONSTRAINT chk_cantidad_positiva CHECK ((cantidad > 0)),
    CONSTRAINT chk_porcentaje_descuento CHECK (((porcentaje_descuento >= (0)::numeric) AND (porcentaje_descuento <= (100)::numeric)))
);


--
-- Name: TABLE detalle_compra; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON TABLE operaciones.detalle_compra IS 'Desglose por producto de la orden de compra. Incluye ítems pagados y bonificaciones (regalos del proveedor).';


--
-- Name: COLUMN detalle_compra.porcentaje_descuento; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.detalle_compra.porcentaje_descuento IS 'Porcentaje de descuento aplicado a este ítem. Ej: 10.00 para un 10% de descuento.';


--
-- Name: COLUMN detalle_compra.valor_descuento; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.detalle_compra.valor_descuento IS 'Valor monetario del descuento: (cantidad * precio_unitario) * (porcentaje_descuento / 100).';


--
-- Name: COLUMN detalle_compra.subtotal; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.detalle_compra.subtotal IS 'Subtotal neto de este ítem: (cantidad * precio_unitario) - valor_descuento. Para bonificaciones = $0.';


--
-- Name: COLUMN detalle_compra.es_bonificacion; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.detalle_compra.es_bonificacion IS 'TRUE = Producto de regalo (precio $0). Se incluye en el conteo de unidades para cálculo de costo promedio.';


--
-- Name: detalle_compra_id_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.detalle_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detalle_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.detalle_compra_id_seq OWNED BY operaciones.detalle_compra.id;


--
-- Name: detalle_venta; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.detalle_venta (
    id_detalle integer NOT NULL,
    id_venta integer,
    id_lote integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2),
    subtotal_linea numeric(10,2),
    es_combo_ia boolean DEFAULT false,
    id_promocion integer
);


--
-- Name: detalle_venta_id_detalle_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.detalle_venta_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detalle_venta_id_detalle_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.detalle_venta_id_detalle_seq OWNED BY operaciones.detalle_venta.id_detalle;


--
-- Name: detalle_ventas; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.detalle_ventas (
    id integer NOT NULL,
    id_venta integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    es_sugerencia_ia boolean DEFAULT false NOT NULL,
    id_lote integer,
    id_promocion integer
);


--
-- Name: TABLE detalle_ventas; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON TABLE operaciones.detalle_ventas IS 'Detalle de los productos vendidos en la Orden de Venta en campo';


--
-- Name: detalle_ventas_id_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.detalle_ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detalle_ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.detalle_ventas_id_seq OWNED BY operaciones.detalle_ventas.id;


--
-- Name: devoluciones; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.devoluciones (
    id_devolucion integer NOT NULL,
    fecha_devolucion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    motivo text NOT NULL,
    cantidad integer NOT NULL,
    id_lote integer NOT NULL,
    id_proveedor integer NOT NULL,
    id_usuario_supervisor integer NOT NULL,
    id_estado_aprobacion integer NOT NULL,
    CONSTRAINT devoluciones_cantidad_check CHECK ((cantidad > 0))
);


--
-- Name: devoluciones_id_devolucion_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

ALTER TABLE operaciones.devoluciones ALTER COLUMN id_devolucion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME operaciones.devoluciones_id_devolucion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: devoluciones_venta; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.devoluciones_venta (
    id integer NOT NULL,
    id_venta integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad_devuelta integer NOT NULL,
    motivo character varying(50) NOT NULL,
    fecha_solicitud timestamp without time zone NOT NULL,
    estado_logistico character varying(30) NOT NULL,
    estado_inventario character varying(30),
    id_lote integer,
    fecha_recepcion timestamp without time zone
);


--
-- Name: TABLE devoluciones_venta; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON TABLE operaciones.devoluciones_venta IS 'Registro de devoluciones de productos desde el campo por el cliente hacia el Bodeguero';


--
-- Name: devoluciones_venta_id_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.devoluciones_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: devoluciones_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.devoluciones_venta_id_seq OWNED BY operaciones.devoluciones_venta.id;


--
-- Name: documento_orden_compra; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.documento_orden_compra (
    id_documento integer NOT NULL,
    id_orden_compra integer NOT NULL,
    nombre_archivo character varying(255) NOT NULL,
    url_archivo text NOT NULL,
    tipo_documento character varying(50) DEFAULT 'FACTURA'::character varying NOT NULL,
    fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_usuario_subida integer,
    CONSTRAINT ck_dococ_tipo CHECK (((tipo_documento)::text = ANY ((ARRAY['FACTURA'::character varying, 'GUIA_REMISION'::character varying, 'NOTA_CREDITO'::character varying, 'OTRO'::character varying])::text[])))
);


--
-- Name: TABLE documento_orden_compra; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON TABLE operaciones.documento_orden_compra IS 'Evidencia documental de una compra: factura escaneada, guía de remisión, etc.';


--
-- Name: documento_orden_compra_id_documento_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.documento_orden_compra_id_documento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documento_orden_compra_id_documento_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.documento_orden_compra_id_documento_seq OWNED BY operaciones.documento_orden_compra.id_documento;


--
-- Name: movimientos_inventario; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.movimientos_inventario (
    id_movimiento integer NOT NULL,
    fecha_movimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cantidad integer NOT NULL,
    observacion text,
    id_lote integer NOT NULL,
    id_tipo_movimiento integer NOT NULL,
    id_usuario integer NOT NULL,
    id_estado_aprobacion integer NOT NULL,
    CONSTRAINT movimientos_inventario_cantidad_check CHECK ((cantidad > 0))
);


--
-- Name: movimientos_inventario_id_movimiento_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

ALTER TABLE operaciones.movimientos_inventario ALTER COLUMN id_movimiento ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME operaciones.movimientos_inventario_id_movimiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: orden_compra; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.orden_compra (
    id integer NOT NULL,
    id_proveedor integer NOT NULL,
    numero_factura character varying(50) NOT NULL,
    fecha_emision date NOT NULL,
    subtotal_bruto numeric(10,2) DEFAULT 0.00,
    total_descuentos numeric(10,2) DEFAULT 0.00,
    costo_transporte numeric(10,2) DEFAULT 0.00,
    impuestos numeric(10,2) DEFAULT 0.00,
    total_neto numeric(10,2) DEFAULT 0.00,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying,
    fecha_registro timestamp without time zone DEFAULT now(),
    fecha_llegada_estimada date,
    ventana_horaria character varying(50),
    fecha_llegada_real timestamp without time zone,
    estado_cumplimiento character varying(20) DEFAULT 'PENDIENTE'::character varying,
    observacion_retraso text,
    id_usuario_registro integer,
    iva_aplicado numeric(12,2) DEFAULT 0 NOT NULL,
    CONSTRAINT chk_estado_orden_compra CHECK (((estado)::text = ANY (ARRAY[('PENDIENTE'::character varying)::text, ('RECEPCIONADA'::character varying)::text, ('ANULADA'::character varying)::text])))
);


--
-- Name: TABLE orden_compra; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON TABLE operaciones.orden_compra IS 'Cabecera de la orden de compra. El Supervisor transcribe la factura física del proveedor en esta tabla.';


--
-- Name: COLUMN orden_compra.subtotal_bruto; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.orden_compra.subtotal_bruto IS 'Suma de (cantidad * precio_unitario) de todos los ítems NO bonificación, ANTES de aplicar descuentos.';


--
-- Name: COLUMN orden_compra.total_descuentos; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.orden_compra.total_descuentos IS 'Suma total de todos los descuentos por ítem aplicados a la orden.';


--
-- Name: COLUMN orden_compra.costo_transporte; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.orden_compra.costo_transporte IS 'Costo del flete/envío pagado al proveedor. Ingresado manualmente por el Supervisor.';


--
-- Name: COLUMN orden_compra.total_neto; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.orden_compra.total_neto IS 'Lo que realmente se paga: subtotal_bruto - total_descuentos + costo_transporte + impuestos.';


--
-- Name: COLUMN orden_compra.estado; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.orden_compra.estado IS 'PENDIENTE = Factura registrada, esperando recepción física. RECEPCIONADA = Bodeguero confirmó ingreso. ANULADA = Cancelada.';


--
-- Name: COLUMN orden_compra.id_usuario_registro; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.orden_compra.id_usuario_registro IS 'ID del usuario (supervisor) que creó/registró esta orden de compra. NULL para registros históricos pre-V002.';


--
-- Name: COLUMN orden_compra.iva_aplicado; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.orden_compra.iva_aplicado IS 'IVA total de la orden, calculado en el servidor sumando el IVA de cada línea según aplica_iva y porcentaje_iva del producto.';


--
-- Name: orden_compra_id_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.orden_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orden_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.orden_compra_id_seq OWNED BY operaciones.orden_compra.id;


--
-- Name: tecnico_campo; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.tecnico_campo (
    id_tecnico integer NOT NULL,
    cedula character varying(20) NOT NULL,
    nombres character varying(150) NOT NULL,
    apellidos character varying(150) NOT NULL,
    telefono character varying(30),
    licencia_agricola character varying(100),
    id_usuario integer NOT NULL,
    id_estado integer
);


--
-- Name: tecnico_campo_id_tecnico_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

ALTER TABLE operaciones.tecnico_campo ALTER COLUMN id_tecnico ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME operaciones.tecnico_campo_id_tecnico_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: temporada; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.temporada (
    id_temporada integer NOT NULL,
    nombre character varying(100) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    estado character varying(20) NOT NULL,
    fecha_creacion timestamp without time zone NOT NULL,
    id_cultivo integer
);


--
-- Name: temporada_id_temporada_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.temporada_id_temporada_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: temporada_id_temporada_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.temporada_id_temporada_seq OWNED BY operaciones.temporada.id_temporada;


--
-- Name: uso_campo; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.uso_campo (
    id_uso integer NOT NULL,
    parcela character varying(150) NOT NULL,
    cultivo character varying(150) NOT NULL,
    fecha_aplicacion date NOT NULL,
    cantidad_usada integer NOT NULL,
    observacion text,
    id_lote integer NOT NULL,
    id_usuario_tecnico integer NOT NULL,
    activo boolean DEFAULT true,
    id_estado integer,
    id_cliente integer,
    descripcion_plaga character varying(500),
    tipo_registro character varying(50) DEFAULT 'USO_CAMPO'::character varying,
    id_estado_pedido integer DEFAULT 1,
    id_combo_aplicado integer,
    cantidad_reservada integer DEFAULT 0,
    CONSTRAINT uso_campo_cantidad_usada_check CHECK ((cantidad_usada > 0))
);


--
-- Name: COLUMN uso_campo.tipo_registro; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.uso_campo.tipo_registro IS 'USO_CAMPO = aplicación agrícola clásica. ORDEN_PEDIDO = pedido de venta al cliente.';


--
-- Name: COLUMN uso_campo.id_estado_pedido; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.uso_campo.id_estado_pedido IS '1=PENDIENTE_BODEGA, 2=DESPACHADO, 3=ENTREGADO, 4=CANCELADO, 5=DEVUELTO';


--
-- Name: COLUMN uso_campo.cantidad_reservada; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON COLUMN operaciones.uso_campo.cantidad_reservada IS 'Unidades reservadas en el lote. Se libera al despachar.';


--
-- Name: uso_campo_id_uso_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

ALTER TABLE operaciones.uso_campo ALTER COLUMN id_uso ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME operaciones.uso_campo_id_uso_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: venta; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.venta (
    id_venta integer NOT NULL,
    numero_orden character varying(30) NOT NULL,
    fecha_venta timestamp without time zone,
    id_cliente integer,
    id_tecnico integer,
    subtotal numeric(10,2),
    descuento_total numeric(10,2),
    total numeric(10,2),
    id_estado integer
);


--
-- Name: venta_id_venta_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.venta_id_venta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: venta_id_venta_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.venta_id_venta_seq OWNED BY operaciones.venta.id_venta;


--
-- Name: ventas; Type: TABLE; Schema: operaciones; Owner: -
--

CREATE TABLE operaciones.ventas (
    id integer NOT NULL,
    id_cliente integer NOT NULL,
    id_tecnico integer NOT NULL,
    numero_comprobante character varying(50) NOT NULL,
    fecha timestamp without time zone NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    iva_aplicado numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    estado character varying(30) DEFAULT 'CONFIRMADA'::character varying NOT NULL,
    costo_envio numeric(10,2),
    metodo_pago character varying(30),
    referencia_pago character varying(100),
    fecha_estimada_entrega date,
    ventana_horaria character varying(50),
    descuento_total numeric(10,2) DEFAULT 0
);


--
-- Name: TABLE ventas; Type: COMMENT; Schema: operaciones; Owner: -
--

COMMENT ON TABLE operaciones.ventas IS 'Cabecera de las ventas realizadas en campo por el Técnico-Comercial';


--
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: operaciones; Owner: -
--

CREATE SEQUENCE operaciones.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: operaciones; Owner: -
--

ALTER SEQUENCE operaciones.ventas_id_seq OWNED BY operaciones.ventas.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


--
-- Name: v_id_proveedor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_id_proveedor (
    id_proveedor integer
);


--
-- Name: auditoria; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.auditoria (
    id_auditoria bigint NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer NOT NULL,
    accion character varying(255) NOT NULL,
    tabla_afectada character varying(100) NOT NULL,
    valor_anterior text,
    valor_nuevo text,
    descripcion text,
    fecha_hora timestamp(6) without time zone,
    operacion character varying(50)
);


--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.auditoria ALTER COLUMN id_auditoria ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.auditoria_id_auditoria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: historial_sesion; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.historial_sesion (
    id_sesion bigint NOT NULL,
    id_usuario integer NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_fin timestamp without time zone,
    ip_origen character varying(45),
    fecha_ingreso timestamp(6) without time zone,
    fecha_salida timestamp(6) without time zone,
    ip_acceso character varying(50),
    rol_utilizado character varying(100)
);


--
-- Name: historial_sesion_id_sesion_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.historial_sesion ALTER COLUMN id_sesion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.historial_sesion_id_sesion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: privilegio; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.privilegio (
    id_privilegio integer NOT NULL,
    nombre character varying(150) NOT NULL,
    accion character varying(100) NOT NULL,
    id_tipo_objeto integer NOT NULL,
    activo boolean DEFAULT true,
    esquema character varying(100),
    nombre_tabla character varying(100)
);


--
-- Name: privilegio_id_privilegio_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.privilegio ALTER COLUMN id_privilegio ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.privilegio_id_privilegio_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.rol (
    id_rol integer NOT NULL,
    nombre character varying(100) NOT NULL,
    id_rol_bd integer NOT NULL,
    id_estado integer NOT NULL
);


--
-- Name: rol_bd; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.rol_bd (
    id_rol_bd integer NOT NULL,
    nombre_rol_bd character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);


--
-- Name: rol_bd_id_rol_bd_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.rol_bd ALTER COLUMN id_rol_bd ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.rol_bd_id_rol_bd_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.rol ALTER COLUMN id_rol ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.rol_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol_privilegio; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.rol_privilegio (
    id_rol integer NOT NULL,
    id_privilegio integer NOT NULL,
    id_rol_privilegio integer NOT NULL
);


--
-- Name: rol_privilegio_id_rol_privilegio_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.rol_privilegio ALTER COLUMN id_rol_privilegio ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.rol_privilegio_id_rol_privilegio_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: solicitud_registro; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.solicitud_registro (
    id_solicitud integer NOT NULL,
    correo character varying(150) NOT NULL,
    nombres character varying(150) NOT NULL,
    apellidos character varying(150) NOT NULL,
    cedula character varying(20) NOT NULL,
    telefono character varying(30),
    departamento character varying(100),
    cargo character varying(100),
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_estado integer DEFAULT 1,
    motivo_rechazo text,
    procesado_por integer,
    fecha_procesamiento timestamp without time zone
);


--
-- Name: solicitud_registro_id_solicitud_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

CREATE SEQUENCE seguridad.solicitud_registro_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitud_registro_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: seguridad; Owner: -
--

ALTER SEQUENCE seguridad.solicitud_registro_id_solicitud_seq OWNED BY seguridad.solicitud_registro.id_solicitud;


--
-- Name: tipo_objeto_seguridad; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.tipo_objeto_seguridad (
    id_tipo_objeto integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);


--
-- Name: tipo_objeto_seguridad_id_tipo_objeto_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.tipo_objeto_seguridad ALTER COLUMN id_tipo_objeto ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.tipo_objeto_seguridad_id_tipo_objeto_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuario; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.usuario (
    id_usuario integer NOT NULL,
    correo character varying(150) NOT NULL,
    contrasena character varying(255) NOT NULL,
    id_estado integer NOT NULL,
    fecha_creacion timestamp without time zone,
    fecha_actualizacion timestamp(6) without time zone,
    requiere_cambio_clave boolean DEFAULT false
);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.usuario ALTER COLUMN id_usuario ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuario_rol; Type: TABLE; Schema: seguridad; Owner: -
--

CREATE TABLE seguridad.usuario_rol (
    id_usuario integer NOT NULL,
    id_rol integer NOT NULL,
    id_usuario_rol integer NOT NULL
);


--
-- Name: usuario_rol_id_usuario_rol_seq; Type: SEQUENCE; Schema: seguridad; Owner: -
--

ALTER TABLE seguridad.usuario_rol ALTER COLUMN id_usuario_rol ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME seguridad.usuario_rol_id_usuario_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cat_estado_alerta id_estado_alerta; Type: DEFAULT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_alerta ALTER COLUMN id_estado_alerta SET DEFAULT nextval('catalogos.cat_estado_alerta_id_estado_alerta_seq'::regclass);


--
-- Name: cat_estado_promocion id_estado_promocion; Type: DEFAULT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_promocion ALTER COLUMN id_estado_promocion SET DEFAULT nextval('catalogos.cat_estado_promocion_id_estado_promocion_seq'::regclass);


--
-- Name: cat_estado_temporada id_estado_temporada; Type: DEFAULT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_temporada ALTER COLUMN id_estado_temporada SET DEFAULT nextval('catalogos.cat_estado_temporada_id_estado_temporada_seq'::regclass);


--
-- Name: cat_estado_venta id_estado_venta; Type: DEFAULT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_venta ALTER COLUMN id_estado_venta SET DEFAULT nextval('catalogos.cat_estado_venta_id_estado_venta_seq'::regclass);


--
-- Name: formulacion id_formulacion; Type: DEFAULT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.formulacion ALTER COLUMN id_formulacion SET DEFAULT nextval('catalogos.formulacion_id_formulacion_seq'::regclass);


--
-- Name: toxicidad id_toxicidad; Type: DEFAULT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.toxicidad ALTER COLUMN id_toxicidad SET DEFAULT nextval('catalogos.toxicidad_id_toxicidad_seq'::regclass);


--
-- Name: cliente id_cliente; Type: DEFAULT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.cliente ALTER COLUMN id_cliente SET DEFAULT nextval('entidades.cliente_id_cliente_seq'::regclass);


--
-- Name: clientes id_cliente; Type: DEFAULT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.clientes ALTER COLUMN id_cliente SET DEFAULT nextval('entidades.clientes_id_cliente_seq'::regclass);


--
-- Name: proveedor_producto id_proveedor_producto; Type: DEFAULT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor_producto ALTER COLUMN id_proveedor_producto SET DEFAULT nextval('entidades.proveedor_producto_id_proveedor_producto_seq'::regclass);


--
-- Name: detalle_compra id; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_compra ALTER COLUMN id SET DEFAULT nextval('operaciones.detalle_compra_id_seq'::regclass);


--
-- Name: detalle_venta id_detalle; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_venta ALTER COLUMN id_detalle SET DEFAULT nextval('operaciones.detalle_venta_id_detalle_seq'::regclass);


--
-- Name: detalle_ventas id; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_ventas ALTER COLUMN id SET DEFAULT nextval('operaciones.detalle_ventas_id_seq'::regclass);


--
-- Name: devoluciones_venta id; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones_venta ALTER COLUMN id SET DEFAULT nextval('operaciones.devoluciones_venta_id_seq'::regclass);


--
-- Name: documento_orden_compra id_documento; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.documento_orden_compra ALTER COLUMN id_documento SET DEFAULT nextval('operaciones.documento_orden_compra_id_documento_seq'::regclass);


--
-- Name: orden_compra id; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.orden_compra ALTER COLUMN id SET DEFAULT nextval('operaciones.orden_compra_id_seq'::regclass);


--
-- Name: temporada id_temporada; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.temporada ALTER COLUMN id_temporada SET DEFAULT nextval('operaciones.temporada_id_temporada_seq'::regclass);


--
-- Name: venta id_venta; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.venta ALTER COLUMN id_venta SET DEFAULT nextval('operaciones.venta_id_venta_seq'::regclass);


--
-- Name: ventas id; Type: DEFAULT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.ventas ALTER COLUMN id SET DEFAULT nextval('operaciones.ventas_id_seq'::regclass);


--
-- Name: solicitud_registro id_solicitud; Type: DEFAULT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.solicitud_registro ALTER COLUMN id_solicitud SET DEFAULT nextval('seguridad.solicitud_registro_id_solicitud_seq'::regclass);


--
-- Name: cat_cultivo cat_cultivo_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_cultivo
    ADD CONSTRAINT cat_cultivo_nombre_key UNIQUE (nombre);


--
-- Name: cat_cultivo cat_cultivo_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_cultivo
    ADD CONSTRAINT cat_cultivo_pkey PRIMARY KEY (id_cultivo);


--
-- Name: cat_estado_alerta cat_estado_alerta_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_alerta
    ADD CONSTRAINT cat_estado_alerta_pkey PRIMARY KEY (id_estado_alerta);


--
-- Name: cat_estado_aprobacion cat_estado_aprobacion_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_aprobacion
    ADD CONSTRAINT cat_estado_aprobacion_nombre_key UNIQUE (nombre);


--
-- Name: cat_estado_aprobacion cat_estado_aprobacion_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_aprobacion
    ADD CONSTRAINT cat_estado_aprobacion_pkey PRIMARY KEY (id_estado_aprobacion);


--
-- Name: cat_estado_general cat_estado_general_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_general
    ADD CONSTRAINT cat_estado_general_nombre_key UNIQUE (nombre);


--
-- Name: cat_estado_general cat_estado_general_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_general
    ADD CONSTRAINT cat_estado_general_pkey PRIMARY KEY (id_estado);


--
-- Name: cat_estado_lote cat_estado_lote_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_lote
    ADD CONSTRAINT cat_estado_lote_nombre_key UNIQUE (nombre);


--
-- Name: cat_estado_lote cat_estado_lote_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_lote
    ADD CONSTRAINT cat_estado_lote_pkey PRIMARY KEY (id_estado_lote);


--
-- Name: cat_estado_promocion cat_estado_promocion_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_promocion
    ADD CONSTRAINT cat_estado_promocion_pkey PRIMARY KEY (id_estado_promocion);


--
-- Name: cat_estado_temporada cat_estado_temporada_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_temporada
    ADD CONSTRAINT cat_estado_temporada_pkey PRIMARY KEY (id_estado_temporada);


--
-- Name: cat_estado_venta cat_estado_venta_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_estado_venta
    ADD CONSTRAINT cat_estado_venta_pkey PRIMARY KEY (id_estado_venta);


--
-- Name: cat_nivel_alerta cat_nivel_alerta_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_nivel_alerta
    ADD CONSTRAINT cat_nivel_alerta_nombre_key UNIQUE (nombre);


--
-- Name: cat_nivel_alerta cat_nivel_alerta_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_nivel_alerta
    ADD CONSTRAINT cat_nivel_alerta_pkey PRIMARY KEY (id_nivel_alerta);


--
-- Name: cat_plaga cat_plaga_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_plaga
    ADD CONSTRAINT cat_plaga_nombre_key UNIQUE (nombre);


--
-- Name: cat_plaga cat_plaga_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_plaga
    ADD CONSTRAINT cat_plaga_pkey PRIMARY KEY (id_plaga);


--
-- Name: cat_tipo_movimiento cat_tipo_movimiento_naturaleza_check; Type: CHECK CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE catalogos.cat_tipo_movimiento
    ADD CONSTRAINT cat_tipo_movimiento_naturaleza_check CHECK (((naturaleza)::text = ANY (ARRAY[('ENTRADA'::character varying)::text, ('SALIDA'::character varying)::text, ('TRASLADO'::character varying)::text]))) NOT VALID;


--
-- Name: cat_tipo_movimiento cat_tipo_movimiento_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_tipo_movimiento
    ADD CONSTRAINT cat_tipo_movimiento_nombre_key UNIQUE (nombre);


--
-- Name: cat_tipo_movimiento cat_tipo_movimiento_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_tipo_movimiento
    ADD CONSTRAINT cat_tipo_movimiento_pkey PRIMARY KEY (id_tipo_movimiento);


--
-- Name: formulacion formulacion_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.formulacion
    ADD CONSTRAINT formulacion_pkey PRIMARY KEY (id_formulacion);


--
-- Name: toxicidad toxicidad_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.toxicidad
    ADD CONSTRAINT toxicidad_pkey PRIMARY KEY (id_toxicidad);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- Name: clientes clientes_cedula_key; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.clientes
    ADD CONSTRAINT clientes_cedula_key UNIQUE (cedula);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente);


--
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa);


--
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor);


--
-- Name: proveedor_producto proveedor_producto_id_proveedor_id_producto_key; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor_producto
    ADD CONSTRAINT proveedor_producto_id_proveedor_id_producto_key UNIQUE (id_proveedor, id_producto);


--
-- Name: proveedor_producto proveedor_producto_pkey; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor_producto
    ADD CONSTRAINT proveedor_producto_pkey PRIMARY KEY (id_proveedor_producto);


--
-- Name: proveedor proveedor_ruc_key; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor
    ADD CONSTRAINT proveedor_ruc_key UNIQUE (ruc);


--
-- Name: proveedor uk_proveedor_ruc; Type: CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor
    ADD CONSTRAINT uk_proveedor_ruc UNIQUE (ruc);


--
-- Name: ciudad ciudad_pkey; Type: CONSTRAINT; Schema: geografia; Owner: -
--

ALTER TABLE ONLY geografia.ciudad
    ADD CONSTRAINT ciudad_pkey PRIMARY KEY (id_ciudad);


--
-- Name: pais pais_nombre_key; Type: CONSTRAINT; Schema: geografia; Owner: -
--

ALTER TABLE ONLY geografia.pais
    ADD CONSTRAINT pais_nombre_key UNIQUE (nombre);


--
-- Name: pais pais_pkey; Type: CONSTRAINT; Schema: geografia; Owner: -
--

ALTER TABLE ONLY geografia.pais
    ADD CONSTRAINT pais_pkey PRIMARY KEY (id_pais);


--
-- Name: provincia provincia_pkey; Type: CONSTRAINT; Schema: geografia; Owner: -
--

ALTER TABLE ONLY geografia.provincia
    ADD CONSTRAINT provincia_pkey PRIMARY KEY (id_provincia);


--
-- Name: administrador administrador_cedula_key; Type: CONSTRAINT; Schema: gerencia; Owner: -
--

ALTER TABLE ONLY gerencia.administrador
    ADD CONSTRAINT administrador_cedula_key UNIQUE (cedula);


--
-- Name: administrador administrador_id_usuario_key; Type: CONSTRAINT; Schema: gerencia; Owner: -
--

ALTER TABLE ONLY gerencia.administrador
    ADD CONSTRAINT administrador_id_usuario_key UNIQUE (id_usuario);


--
-- Name: administrador administrador_pkey; Type: CONSTRAINT; Schema: gerencia; Owner: -
--

ALTER TABLE ONLY gerencia.administrador
    ADD CONSTRAINT administrador_pkey PRIMARY KEY (id_administrador);


--
-- Name: alertas_caducidad alertas_caducidad_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.alertas_caducidad
    ADD CONSTRAINT alertas_caducidad_pkey PRIMARY KEY (id_alerta);


--
-- Name: configuracion_alertas configuracion_alertas_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.configuracion_alertas
    ADD CONSTRAINT configuracion_alertas_pkey PRIMARY KEY (id_configuracion);


--
-- Name: ejecucion_ia ejecucion_ia_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.ejecucion_ia
    ADD CONSTRAINT ejecucion_ia_pkey PRIMARY KEY (id_ejecucion);


--
-- Name: modelo_ia modelo_ia_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.modelo_ia
    ADD CONSTRAINT modelo_ia_pkey PRIMARY KEY (id_modelo);


--
-- Name: notificacion notificacion_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.notificacion
    ADD CONSTRAINT notificacion_pkey PRIMARY KEY (id_notificacion);


--
-- Name: promocion_detalle promocion_detalle_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promocion_detalle
    ADD CONSTRAINT promocion_detalle_pkey PRIMARY KEY (id_detalle);


--
-- Name: promociones promociones_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promociones
    ADD CONSTRAINT promociones_pkey PRIMARY KEY (id_promocion);


--
-- Name: regla_negocio_ia regla_negocio_ia_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.regla_negocio_ia
    ADD CONSTRAINT regla_negocio_ia_pkey PRIMARY KEY (id_regla);


--
-- Name: sugerencias_ia sugerencias_ia_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_pkey PRIMARY KEY (id_sugerencia);


--
-- Name: temporadas_agricolas temporadas_agricolas_pkey; Type: CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.temporadas_agricolas
    ADD CONSTRAINT temporadas_agricolas_pkey PRIMARY KEY (id_temporada);


--
-- Name: almacen almacen_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.almacen
    ADD CONSTRAINT almacen_pkey PRIMARY KEY (id_almacen);


--
-- Name: bodeguero bodeguero_cedula_key; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.bodeguero
    ADD CONSTRAINT bodeguero_cedula_key UNIQUE (cedula);


--
-- Name: bodeguero bodeguero_id_usuario_key; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.bodeguero
    ADD CONSTRAINT bodeguero_id_usuario_key UNIQUE (id_usuario);


--
-- Name: bodeguero bodeguero_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.bodeguero
    ADD CONSTRAINT bodeguero_pkey PRIMARY KEY (id_bodeguero);


--
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria);


--
-- Name: documentos_lote documentos_lote_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.documentos_lote
    ADD CONSTRAINT documentos_lote_pkey PRIMARY KEY (id_documento);


--
-- Name: estanteria estanteria_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.estanteria
    ADD CONSTRAINT estanteria_pkey PRIMARY KEY (id_estanteria);


--
-- Name: historial_estado_lote historial_estado_lote_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.historial_estado_lote
    ADD CONSTRAINT historial_estado_lote_pkey PRIMARY KEY (id_historial);


--
-- Name: lotes lotes_numero_lote_key; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT lotes_numero_lote_key UNIQUE (numero_lote);


--
-- Name: lotes lotes_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT lotes_pkey PRIMARY KEY (id_lote);


--
-- Name: producto_cultivo producto_cultivo_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto_cultivo
    ADD CONSTRAINT producto_cultivo_pkey PRIMARY KEY (id_producto, id_cultivo);


--
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id_producto);


--
-- Name: producto_plaga producto_plaga_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto_plaga
    ADD CONSTRAINT producto_plaga_pkey PRIMARY KEY (id_producto, id_plaga);


--
-- Name: registro_sanitario registro_sanitario_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.registro_sanitario
    ADD CONSTRAINT registro_sanitario_pkey PRIMARY KEY (id_registro);


--
-- Name: supervisor supervisor_cedula_key; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.supervisor
    ADD CONSTRAINT supervisor_cedula_key UNIQUE (cedula);


--
-- Name: supervisor supervisor_id_usuario_key; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.supervisor
    ADD CONSTRAINT supervisor_id_usuario_key UNIQUE (id_usuario);


--
-- Name: supervisor supervisor_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.supervisor
    ADD CONSTRAINT supervisor_pkey PRIMARY KEY (id_supervisor);


--
-- Name: ubicacion_interna ubicacion_interna_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.ubicacion_interna
    ADD CONSTRAINT ubicacion_interna_pkey PRIMARY KEY (id_ubicacion);


--
-- Name: zona_almacen zona_almacen_pkey; Type: CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.zona_almacen
    ADD CONSTRAINT zona_almacen_pkey PRIMARY KEY (id_zona);


--
-- Name: detalle_compra detalle_compra_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_compra
    ADD CONSTRAINT detalle_compra_pkey PRIMARY KEY (id);


--
-- Name: detalle_venta detalle_venta_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_venta
    ADD CONSTRAINT detalle_venta_pkey PRIMARY KEY (id_detalle);


--
-- Name: detalle_ventas detalle_ventas_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_ventas
    ADD CONSTRAINT detalle_ventas_pkey PRIMARY KEY (id);


--
-- Name: devoluciones devoluciones_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones
    ADD CONSTRAINT devoluciones_pkey PRIMARY KEY (id_devolucion);


--
-- Name: devoluciones_venta devoluciones_venta_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones_venta
    ADD CONSTRAINT devoluciones_venta_pkey PRIMARY KEY (id);


--
-- Name: documento_orden_compra documento_orden_compra_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.documento_orden_compra
    ADD CONSTRAINT documento_orden_compra_pkey PRIMARY KEY (id_documento);


--
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id_movimiento);


--
-- Name: orden_compra orden_compra_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.orden_compra
    ADD CONSTRAINT orden_compra_pkey PRIMARY KEY (id);


--
-- Name: tecnico_campo tecnico_campo_cedula_key; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.tecnico_campo
    ADD CONSTRAINT tecnico_campo_cedula_key UNIQUE (cedula);


--
-- Name: tecnico_campo tecnico_campo_id_usuario_key; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.tecnico_campo
    ADD CONSTRAINT tecnico_campo_id_usuario_key UNIQUE (id_usuario);


--
-- Name: tecnico_campo tecnico_campo_licencia_agricola_key; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.tecnico_campo
    ADD CONSTRAINT tecnico_campo_licencia_agricola_key UNIQUE (licencia_agricola);


--
-- Name: tecnico_campo tecnico_campo_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.tecnico_campo
    ADD CONSTRAINT tecnico_campo_pkey PRIMARY KEY (id_tecnico);


--
-- Name: temporada temporada_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.temporada
    ADD CONSTRAINT temporada_pkey PRIMARY KEY (id_temporada);


--
-- Name: uso_campo uso_campo_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.uso_campo
    ADD CONSTRAINT uso_campo_pkey PRIMARY KEY (id_uso);


--
-- Name: venta venta_numero_orden_key; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.venta
    ADD CONSTRAINT venta_numero_orden_key UNIQUE (numero_orden);


--
-- Name: venta venta_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.venta
    ADD CONSTRAINT venta_pkey PRIMARY KEY (id_venta);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria);


--
-- Name: historial_sesion historial_sesion_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.historial_sesion
    ADD CONSTRAINT historial_sesion_pkey PRIMARY KEY (id_sesion);


--
-- Name: privilegio privilegio_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.privilegio
    ADD CONSTRAINT privilegio_pkey PRIMARY KEY (id_privilegio);


--
-- Name: rol_bd rol_bd_nombre_rol_bd_key; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_bd
    ADD CONSTRAINT rol_bd_nombre_rol_bd_key UNIQUE (nombre_rol_bd);


--
-- Name: rol_bd rol_bd_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_bd
    ADD CONSTRAINT rol_bd_pkey PRIMARY KEY (id_rol_bd);


--
-- Name: rol rol_nombre_key; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol
    ADD CONSTRAINT rol_nombre_key UNIQUE (nombre);


--
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- Name: rol_privilegio rol_privilegio_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_privilegio
    ADD CONSTRAINT rol_privilegio_pkey PRIMARY KEY (id_rol, id_privilegio);


--
-- Name: solicitud_registro solicitud_registro_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.solicitud_registro
    ADD CONSTRAINT solicitud_registro_pkey PRIMARY KEY (id_solicitud);


--
-- Name: tipo_objeto_seguridad tipo_objeto_seguridad_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.tipo_objeto_seguridad
    ADD CONSTRAINT tipo_objeto_seguridad_pkey PRIMARY KEY (id_tipo_objeto);


--
-- Name: usuario usuario_correo_key; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario
    ADD CONSTRAINT usuario_correo_key UNIQUE (correo);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: usuario_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (id_usuario, id_rol);


--
-- Name: idx_pp_producto; Type: INDEX; Schema: entidades; Owner: -
--

CREATE INDEX idx_pp_producto ON entidades.proveedor_producto USING btree (id_producto);


--
-- Name: idx_pp_proveedor; Type: INDEX; Schema: entidades; Owner: -
--

CREATE INDEX idx_pp_proveedor ON entidades.proveedor_producto USING btree (id_proveedor);


--
-- Name: ix_proveedor_representante_lower; Type: INDEX; Schema: entidades; Owner: -
--

CREATE INDEX ix_proveedor_representante_lower ON entidades.proveedor USING btree (lower((nombre_representante)::text));


--
-- Name: ix_proveedor_ruc; Type: INDEX; Schema: entidades; Owner: -
--

CREATE INDEX ix_proveedor_ruc ON entidades.proveedor USING btree (ruc);


--
-- Name: ux_proveedor_producto; Type: INDEX; Schema: entidades; Owner: -
--

CREATE UNIQUE INDEX ux_proveedor_producto ON entidades.proveedor_producto USING btree (id_proveedor, id_producto);


--
-- Name: idx_lotes_fe; Type: INDEX; Schema: inventario; Owner: -
--

CREATE INDEX idx_lotes_fe ON inventario.lotes USING btree (id_producto);


--
-- Name: idx_lotes_orden_compra; Type: INDEX; Schema: inventario; Owner: -
--

CREATE INDEX idx_lotes_orden_compra ON inventario.lotes USING btree (id_orden_compra);


--
-- Name: ix_lotes_producto_vencimiento; Type: INDEX; Schema: inventario; Owner: -
--

CREATE INDEX ix_lotes_producto_vencimiento ON inventario.lotes USING btree (id_producto, fecha_vencimiento);


--
-- Name: ix_lotes_ubicacion; Type: INDEX; Schema: inventario; Owner: -
--

CREATE INDEX ix_lotes_ubicacion ON inventario.lotes USING btree (id_ubicacion) WHERE (id_ubicacion IS NOT NULL);


--
-- Name: idx_detalle_compra_orden; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_detalle_compra_orden ON operaciones.detalle_compra USING btree (id_orden_compra);


--
-- Name: idx_detalle_compra_producto; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_detalle_compra_producto ON operaciones.detalle_compra USING btree (id_producto);


--
-- Name: idx_detalle_ventas_lote; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_detalle_ventas_lote ON operaciones.detalle_ventas USING btree (id_lote);


--
-- Name: idx_detalle_ventas_producto; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_detalle_ventas_producto ON operaciones.detalle_ventas USING btree (id_producto);


--
-- Name: idx_detalle_ventas_venta; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_detalle_ventas_venta ON operaciones.detalle_ventas USING btree (id_venta);


--
-- Name: idx_devoluciones_venta_producto; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_devoluciones_venta_producto ON operaciones.devoluciones_venta USING btree (id_producto);


--
-- Name: idx_devoluciones_venta_venta; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_devoluciones_venta_venta ON operaciones.devoluciones_venta USING btree (id_venta);


--
-- Name: idx_orden_compra_estado; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_orden_compra_estado ON operaciones.orden_compra USING btree (estado);


--
-- Name: idx_orden_compra_fecha; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_orden_compra_fecha ON operaciones.orden_compra USING btree (fecha_emision);


--
-- Name: idx_orden_compra_proveedor; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_orden_compra_proveedor ON operaciones.orden_compra USING btree (id_proveedor);


--
-- Name: idx_ventas_cliente; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_ventas_cliente ON operaciones.ventas USING btree (id_cliente);


--
-- Name: idx_ventas_tecnico; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX idx_ventas_tecnico ON operaciones.ventas USING btree (id_tecnico);


--
-- Name: ix_dococ_orden; Type: INDEX; Schema: operaciones; Owner: -
--

CREATE INDEX ix_dococ_orden ON operaciones.documento_orden_compra USING btree (id_orden_compra);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_solicitud_estado; Type: INDEX; Schema: seguridad; Owner: -
--

CREATE INDEX idx_solicitud_estado ON seguridad.solicitud_registro USING btree (id_estado);


--
-- Name: cat_cultivo cat_cultivo_id_estado_fkey; Type: FK CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_cultivo
    ADD CONSTRAINT cat_cultivo_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: cat_plaga cat_plaga_id_estado_fkey; Type: FK CONSTRAINT; Schema: catalogos; Owner: -
--

ALTER TABLE ONLY catalogos.cat_plaga
    ADD CONSTRAINT cat_plaga_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: cliente cliente_id_estado_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.cliente
    ADD CONSTRAINT cliente_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: empresa empresa_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.empresa
    ADD CONSTRAINT empresa_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES geografia.ciudad(id_ciudad);


--
-- Name: empresa empresa_id_estado_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.empresa
    ADD CONSTRAINT empresa_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: clientes fk_cliente_tecnico; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.clientes
    ADD CONSTRAINT fk_cliente_tecnico FOREIGN KEY (id_tecnico_asignado) REFERENCES seguridad.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: proveedor proveedor_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor
    ADD CONSTRAINT proveedor_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES geografia.ciudad(id_ciudad);


--
-- Name: proveedor proveedor_id_empresa_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor
    ADD CONSTRAINT proveedor_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES entidades.empresa(id_empresa);


--
-- Name: proveedor proveedor_id_estado_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor
    ADD CONSTRAINT proveedor_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: proveedor_producto proveedor_producto_id_producto_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor_producto
    ADD CONSTRAINT proveedor_producto_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: proveedor_producto proveedor_producto_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: entidades; Owner: -
--

ALTER TABLE ONLY entidades.proveedor_producto
    ADD CONSTRAINT proveedor_producto_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES entidades.proveedor(id_proveedor);


--
-- Name: ciudad ciudad_id_provincia_fkey; Type: FK CONSTRAINT; Schema: geografia; Owner: -
--

ALTER TABLE ONLY geografia.ciudad
    ADD CONSTRAINT ciudad_id_provincia_fkey FOREIGN KEY (id_provincia) REFERENCES geografia.provincia(id_provincia);


--
-- Name: provincia provincia_id_pais_fkey; Type: FK CONSTRAINT; Schema: geografia; Owner: -
--

ALTER TABLE ONLY geografia.provincia
    ADD CONSTRAINT provincia_id_pais_fkey FOREIGN KEY (id_pais) REFERENCES geografia.pais(id_pais);


--
-- Name: administrador administrador_id_usuario_fkey; Type: FK CONSTRAINT; Schema: gerencia; Owner: -
--

ALTER TABLE ONLY gerencia.administrador
    ADD CONSTRAINT administrador_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: alertas_caducidad alertas_caducidad_id_estado_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.alertas_caducidad
    ADD CONSTRAINT alertas_caducidad_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: alertas_caducidad alertas_caducidad_id_lote_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.alertas_caducidad
    ADD CONSTRAINT alertas_caducidad_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: alertas_caducidad alertas_caducidad_id_nivel_alerta_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.alertas_caducidad
    ADD CONSTRAINT alertas_caducidad_id_nivel_alerta_fkey FOREIGN KEY (id_nivel_alerta) REFERENCES catalogos.cat_nivel_alerta(id_nivel_alerta);


--
-- Name: configuracion_alertas configuracion_alertas_id_nivel_alerta_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.configuracion_alertas
    ADD CONSTRAINT configuracion_alertas_id_nivel_alerta_fkey FOREIGN KEY (id_nivel_alerta) REFERENCES catalogos.cat_nivel_alerta(id_nivel_alerta);


--
-- Name: configuracion_alertas configuracion_alertas_id_usuario_modificador_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.configuracion_alertas
    ADD CONSTRAINT configuracion_alertas_id_usuario_modificador_fkey FOREIGN KEY (id_usuario_modificador) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: ejecucion_ia ejecucion_ia_id_modelo_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.ejecucion_ia
    ADD CONSTRAINT ejecucion_ia_id_modelo_fkey FOREIGN KEY (id_modelo) REFERENCES ia_alertas.modelo_ia(id_modelo);


--
-- Name: alertas_caducidad fk_alerta_estado; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.alertas_caducidad
    ADD CONSTRAINT fk_alerta_estado FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_alerta(id_estado_alerta);


--
-- Name: promociones fk_promocion_estado; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promociones
    ADD CONSTRAINT fk_promocion_estado FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_promocion(id_estado_promocion);


--
-- Name: temporadas_agricolas fk_temporada_estado; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.temporadas_agricolas
    ADD CONSTRAINT fk_temporada_estado FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_temporada(id_estado_temporada);


--
-- Name: notificacion notificacion_id_alerta_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.notificacion
    ADD CONSTRAINT notificacion_id_alerta_fkey FOREIGN KEY (id_alerta) REFERENCES ia_alertas.alertas_caducidad(id_alerta);


--
-- Name: notificacion notificacion_id_usuario_destino_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.notificacion
    ADD CONSTRAINT notificacion_id_usuario_destino_fkey FOREIGN KEY (id_usuario_destino) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: promocion_detalle promocion_detalle_id_producto_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promocion_detalle
    ADD CONSTRAINT promocion_detalle_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: promocion_detalle promocion_detalle_id_promocion_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promocion_detalle
    ADD CONSTRAINT promocion_detalle_id_promocion_fkey FOREIGN KEY (id_promocion) REFERENCES ia_alertas.promociones(id_promocion);


--
-- Name: promociones promociones_id_estado_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promociones
    ADD CONSTRAINT promociones_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: promociones promociones_id_lote_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promociones
    ADD CONSTRAINT promociones_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: promociones promociones_id_sugerencia_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promociones
    ADD CONSTRAINT promociones_id_sugerencia_fkey FOREIGN KEY (id_sugerencia) REFERENCES ia_alertas.sugerencias_ia(id_sugerencia);


--
-- Name: promociones promociones_id_usuario_aprueba_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.promociones
    ADD CONSTRAINT promociones_id_usuario_aprueba_fkey FOREIGN KEY (id_usuario_aprueba) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: sugerencias_ia sugerencias_ia_id_ejecucion_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_id_ejecucion_fkey FOREIGN KEY (id_ejecucion) REFERENCES ia_alertas.ejecucion_ia(id_ejecucion);


--
-- Name: sugerencias_ia sugerencias_ia_id_estado_aprobacion_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_id_estado_aprobacion_fkey FOREIGN KEY (id_estado_aprobacion) REFERENCES catalogos.cat_estado_aprobacion(id_estado_aprobacion);


--
-- Name: sugerencias_ia sugerencias_ia_id_lote_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: sugerencias_ia sugerencias_ia_id_temporada_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.sugerencias_ia
    ADD CONSTRAINT sugerencias_ia_id_temporada_fkey FOREIGN KEY (id_temporada) REFERENCES ia_alertas.temporadas_agricolas(id_temporada);


--
-- Name: temporadas_agricolas temporadas_agricolas_id_cultivo_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.temporadas_agricolas
    ADD CONSTRAINT temporadas_agricolas_id_cultivo_fkey FOREIGN KEY (id_cultivo) REFERENCES catalogos.cat_cultivo(id_cultivo);


--
-- Name: temporadas_agricolas temporadas_agricolas_id_estado_fkey; Type: FK CONSTRAINT; Schema: ia_alertas; Owner: -
--

ALTER TABLE ONLY ia_alertas.temporadas_agricolas
    ADD CONSTRAINT temporadas_agricolas_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: almacen almacen_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.almacen
    ADD CONSTRAINT almacen_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES geografia.ciudad(id_ciudad);


--
-- Name: almacen almacen_id_supervisor_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.almacen
    ADD CONSTRAINT almacen_id_supervisor_fkey FOREIGN KEY (id_supervisor) REFERENCES inventario.supervisor(id_supervisor);


--
-- Name: bodeguero bodeguero_id_usuario_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.bodeguero
    ADD CONSTRAINT bodeguero_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: documentos_lote documentos_lote_id_lote_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.documentos_lote
    ADD CONSTRAINT documentos_lote_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: estanteria estanteria_id_zona_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.estanteria
    ADD CONSTRAINT estanteria_id_zona_fkey FOREIGN KEY (id_zona) REFERENCES inventario.zona_almacen(id_zona);


--
-- Name: lotes fk_lote_almacen; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT fk_lote_almacen FOREIGN KEY (id_almacen) REFERENCES inventario.almacen(id_almacen);


--
-- Name: lotes fk_lote_orden_compra; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT fk_lote_orden_compra FOREIGN KEY (id_orden_compra) REFERENCES operaciones.orden_compra(id) ON DELETE SET NULL;


--
-- Name: lotes fk_lotes_almacen; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT fk_lotes_almacen FOREIGN KEY (id_almacen) REFERENCES inventario.almacen(id_almacen);


--
-- Name: historial_estado_lote historial_estado_lote_id_estado_anterior_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.historial_estado_lote
    ADD CONSTRAINT historial_estado_lote_id_estado_anterior_fkey FOREIGN KEY (id_estado_anterior) REFERENCES catalogos.cat_estado_lote(id_estado_lote);


--
-- Name: historial_estado_lote historial_estado_lote_id_estado_nuevo_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.historial_estado_lote
    ADD CONSTRAINT historial_estado_lote_id_estado_nuevo_fkey FOREIGN KEY (id_estado_nuevo) REFERENCES catalogos.cat_estado_lote(id_estado_lote);


--
-- Name: historial_estado_lote historial_estado_lote_id_lote_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.historial_estado_lote
    ADD CONSTRAINT historial_estado_lote_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: historial_estado_lote historial_estado_lote_id_usuario_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.historial_estado_lote
    ADD CONSTRAINT historial_estado_lote_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: lotes lotes_id_estado_lote_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT lotes_id_estado_lote_fkey FOREIGN KEY (id_estado_lote) REFERENCES catalogos.cat_estado_lote(id_estado_lote);


--
-- Name: lotes lotes_id_producto_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT lotes_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: lotes lotes_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT lotes_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES entidades.proveedor(id_proveedor);


--
-- Name: lotes lotes_id_ubicacion_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.lotes
    ADD CONSTRAINT lotes_id_ubicacion_fkey FOREIGN KEY (id_ubicacion) REFERENCES inventario.ubicacion_interna(id_ubicacion);


--
-- Name: producto_cultivo producto_cultivo_id_cultivo_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto_cultivo
    ADD CONSTRAINT producto_cultivo_id_cultivo_fkey FOREIGN KEY (id_cultivo) REFERENCES catalogos.cat_cultivo(id_cultivo);


--
-- Name: producto_cultivo producto_cultivo_id_producto_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto_cultivo
    ADD CONSTRAINT producto_cultivo_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: producto producto_id_categoria_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto
    ADD CONSTRAINT producto_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES inventario.categoria(id_categoria);


--
-- Name: producto producto_id_estado_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto
    ADD CONSTRAINT producto_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: producto producto_id_formulacion_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto
    ADD CONSTRAINT producto_id_formulacion_fkey FOREIGN KEY (id_formulacion) REFERENCES catalogos.formulacion(id_formulacion);


--
-- Name: producto producto_id_toxicidad_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto
    ADD CONSTRAINT producto_id_toxicidad_fkey FOREIGN KEY (id_toxicidad) REFERENCES catalogos.toxicidad(id_toxicidad);


--
-- Name: producto_plaga producto_plaga_id_plaga_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto_plaga
    ADD CONSTRAINT producto_plaga_id_plaga_fkey FOREIGN KEY (id_plaga) REFERENCES catalogos.cat_plaga(id_plaga);


--
-- Name: producto_plaga producto_plaga_id_producto_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.producto_plaga
    ADD CONSTRAINT producto_plaga_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: registro_sanitario registro_sanitario_id_estado_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.registro_sanitario
    ADD CONSTRAINT registro_sanitario_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: registro_sanitario registro_sanitario_id_producto_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.registro_sanitario
    ADD CONSTRAINT registro_sanitario_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: supervisor supervisor_id_usuario_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.supervisor
    ADD CONSTRAINT supervisor_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: ubicacion_interna ubicacion_interna_id_estanteria_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.ubicacion_interna
    ADD CONSTRAINT ubicacion_interna_id_estanteria_fkey FOREIGN KEY (id_estanteria) REFERENCES inventario.estanteria(id_estanteria);


--
-- Name: zona_almacen zona_almacen_id_almacen_fkey; Type: FK CONSTRAINT; Schema: inventario; Owner: -
--

ALTER TABLE ONLY inventario.zona_almacen
    ADD CONSTRAINT zona_almacen_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES inventario.almacen(id_almacen);


--
-- Name: detalle_venta detalle_venta_id_lote_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_venta
    ADD CONSTRAINT detalle_venta_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: detalle_venta detalle_venta_id_promocion_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_venta
    ADD CONSTRAINT detalle_venta_id_promocion_fkey FOREIGN KEY (id_promocion) REFERENCES ia_alertas.promociones(id_promocion);


--
-- Name: detalle_venta detalle_venta_id_venta_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_venta
    ADD CONSTRAINT detalle_venta_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES operaciones.venta(id_venta);


--
-- Name: devoluciones devoluciones_id_estado_aprobacion_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones
    ADD CONSTRAINT devoluciones_id_estado_aprobacion_fkey FOREIGN KEY (id_estado_aprobacion) REFERENCES catalogos.cat_estado_aprobacion(id_estado_aprobacion);


--
-- Name: devoluciones devoluciones_id_lote_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones
    ADD CONSTRAINT devoluciones_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: devoluciones devoluciones_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones
    ADD CONSTRAINT devoluciones_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES entidades.proveedor(id_proveedor);


--
-- Name: devoluciones devoluciones_id_usuario_supervisor_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones
    ADD CONSTRAINT devoluciones_id_usuario_supervisor_fkey FOREIGN KEY (id_usuario_supervisor) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: devoluciones_venta devoluciones_venta_id_lote_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones_venta
    ADD CONSTRAINT devoluciones_venta_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: detalle_compra fk_detalle_orden_compra; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_compra
    ADD CONSTRAINT fk_detalle_orden_compra FOREIGN KEY (id_orden_compra) REFERENCES operaciones.orden_compra(id) ON DELETE CASCADE;


--
-- Name: detalle_compra fk_detalle_producto; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_compra
    ADD CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto) ON DELETE RESTRICT;


--
-- Name: detalle_ventas fk_detalle_producto; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_ventas
    ADD CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: detalle_ventas fk_detalle_venta; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_ventas
    ADD CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES operaciones.ventas(id) ON DELETE CASCADE;


--
-- Name: detalle_ventas fk_detalle_ventas_lote; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_ventas
    ADD CONSTRAINT fk_detalle_ventas_lote FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: detalle_ventas fk_detalle_ventas_promocion; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.detalle_ventas
    ADD CONSTRAINT fk_detalle_ventas_promocion FOREIGN KEY (id_promocion) REFERENCES ia_alertas.promociones(id_promocion);


--
-- Name: devoluciones_venta fk_devolucion_lote; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones_venta
    ADD CONSTRAINT fk_devolucion_lote FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: devoluciones_venta fk_devolucion_producto; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones_venta
    ADD CONSTRAINT fk_devolucion_producto FOREIGN KEY (id_producto) REFERENCES inventario.producto(id_producto);


--
-- Name: devoluciones_venta fk_devolucion_venta; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.devoluciones_venta
    ADD CONSTRAINT fk_devolucion_venta FOREIGN KEY (id_venta) REFERENCES operaciones.ventas(id) ON DELETE CASCADE;


--
-- Name: documento_orden_compra fk_dococ_orden; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.documento_orden_compra
    ADD CONSTRAINT fk_dococ_orden FOREIGN KEY (id_orden_compra) REFERENCES operaciones.orden_compra(id) ON DELETE CASCADE;


--
-- Name: documento_orden_compra fk_dococ_usuario; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.documento_orden_compra
    ADD CONSTRAINT fk_dococ_usuario FOREIGN KEY (id_usuario_subida) REFERENCES seguridad.usuario(id_usuario) ON DELETE SET NULL;


--
-- Name: orden_compra fk_orden_compra_proveedor; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.orden_compra
    ADD CONSTRAINT fk_orden_compra_proveedor FOREIGN KEY (id_proveedor) REFERENCES entidades.proveedor(id_proveedor) ON DELETE RESTRICT;


--
-- Name: orden_compra fk_orden_compra_usuario_registro; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.orden_compra
    ADD CONSTRAINT fk_orden_compra_usuario_registro FOREIGN KEY (id_usuario_registro) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: ventas fk_ventas_cliente; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.ventas
    ADD CONSTRAINT fk_ventas_cliente FOREIGN KEY (id_cliente) REFERENCES entidades.clientes(id_cliente);


--
-- Name: ventas fk_ventas_tecnico; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.ventas
    ADD CONSTRAINT fk_ventas_tecnico FOREIGN KEY (id_tecnico) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: movimientos_inventario movimientos_inventario_id_estado_aprobacion_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_id_estado_aprobacion_fkey FOREIGN KEY (id_estado_aprobacion) REFERENCES catalogos.cat_estado_aprobacion(id_estado_aprobacion);


--
-- Name: movimientos_inventario movimientos_inventario_id_lote_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: movimientos_inventario movimientos_inventario_id_tipo_movimiento_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_id_tipo_movimiento_fkey FOREIGN KEY (id_tipo_movimiento) REFERENCES catalogos.cat_tipo_movimiento(id_tipo_movimiento);


--
-- Name: movimientos_inventario movimientos_inventario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: tecnico_campo tecnico_campo_id_usuario_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.tecnico_campo
    ADD CONSTRAINT tecnico_campo_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: temporada temporada_id_cultivo_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.temporada
    ADD CONSTRAINT temporada_id_cultivo_fkey FOREIGN KEY (id_cultivo) REFERENCES catalogos.cat_cultivo(id_cultivo);


--
-- Name: uso_campo uso_campo_id_cliente_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.uso_campo
    ADD CONSTRAINT uso_campo_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES entidades.clientes(id_cliente) ON DELETE SET NULL;


--
-- Name: uso_campo uso_campo_id_combo_aplicado_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.uso_campo
    ADD CONSTRAINT uso_campo_id_combo_aplicado_fkey FOREIGN KEY (id_combo_aplicado) REFERENCES ia_alertas.promociones(id_promocion) ON DELETE SET NULL;


--
-- Name: uso_campo uso_campo_id_lote_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.uso_campo
    ADD CONSTRAINT uso_campo_id_lote_fkey FOREIGN KEY (id_lote) REFERENCES inventario.lotes(id_lote);


--
-- Name: uso_campo uso_campo_id_usuario_tecnico_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.uso_campo
    ADD CONSTRAINT uso_campo_id_usuario_tecnico_fkey FOREIGN KEY (id_usuario_tecnico) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: venta venta_id_cliente_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.venta
    ADD CONSTRAINT venta_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES entidades.cliente(id_cliente);


--
-- Name: venta venta_id_estado_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.venta
    ADD CONSTRAINT venta_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_venta(id_estado_venta);


--
-- Name: venta venta_id_tecnico_fkey; Type: FK CONSTRAINT; Schema: operaciones; Owner: -
--

ALTER TABLE ONLY operaciones.venta
    ADD CONSTRAINT venta_id_tecnico_fkey FOREIGN KEY (id_tecnico) REFERENCES operaciones.tecnico_campo(id_tecnico);


--
-- Name: auditoria auditoria_id_usuario_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.auditoria
    ADD CONSTRAINT auditoria_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: historial_sesion historial_sesion_id_usuario_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.historial_sesion
    ADD CONSTRAINT historial_sesion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: privilegio privilegio_id_tipo_objeto_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.privilegio
    ADD CONSTRAINT privilegio_id_tipo_objeto_fkey FOREIGN KEY (id_tipo_objeto) REFERENCES seguridad.tipo_objeto_seguridad(id_tipo_objeto);


--
-- Name: rol rol_id_estado_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol
    ADD CONSTRAINT rol_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: rol rol_id_rol_bd_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol
    ADD CONSTRAINT rol_id_rol_bd_fkey FOREIGN KEY (id_rol_bd) REFERENCES seguridad.rol_bd(id_rol_bd);


--
-- Name: rol_privilegio rol_privilegio_id_privilegio_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_privilegio
    ADD CONSTRAINT rol_privilegio_id_privilegio_fkey FOREIGN KEY (id_privilegio) REFERENCES seguridad.privilegio(id_privilegio);


--
-- Name: rol_privilegio rol_privilegio_id_rol_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.rol_privilegio
    ADD CONSTRAINT rol_privilegio_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES seguridad.rol(id_rol);


--
-- Name: solicitud_registro solicitud_registro_procesado_por_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.solicitud_registro
    ADD CONSTRAINT solicitud_registro_procesado_por_fkey FOREIGN KEY (procesado_por) REFERENCES seguridad.usuario(id_usuario);


--
-- Name: usuario usuario_id_estado_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario
    ADD CONSTRAINT usuario_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES catalogos.cat_estado_general(id_estado);


--
-- Name: usuario_rol usuario_rol_id_rol_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario_rol
    ADD CONSTRAINT usuario_rol_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES seguridad.rol(id_rol);


--
-- Name: usuario_rol usuario_rol_id_usuario_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: -
--

ALTER TABLE ONLY seguridad.usuario_rol
    ADD CONSTRAINT usuario_rol_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES seguridad.usuario(id_usuario);


--
-- PostgreSQL database dump complete
--

\unrestrict r4DgjLa61E8M798jzYTPfnewgabZS0cR0cZ543ezCPCQ5cFQKps8QAOfuWpjvDw

