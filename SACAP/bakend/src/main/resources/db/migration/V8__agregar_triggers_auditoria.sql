-- ============================================================
-- AUDITORÍA — trazas inmutables generadas por triggers de PostgreSQL
-- ============================================================
-- Registra automáticamente cada INSERT/UPDATE/DELETE sobre las tablas
-- "importantes" del sistema en seguridad.auditoria, incluyendo el
-- valor anterior/nuevo de la fila (para el diff de la pantalla de
-- Auditoría) y quién lo hizo (id_usuario + rol de aplicación), tomado
-- de las variables de sesión que el backend fija por request
-- (ver AuditContextAspect.java).
--
-- Idempotente: se puede correr varias veces sin duplicar nada.
-- ============================================================

-- id_usuario puede no conocerse (procesos sin JWT, scripts sueltos, etc.)
ALTER TABLE seguridad.auditoria ALTER COLUMN id_usuario DROP NOT NULL;

CREATE OR REPLACE FUNCTION seguridad.fn_registrar_auditoria()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_usuario INTEGER;
    v_rol_app    TEXT;
    v_anterior   JSONB;
    v_nuevo      JSONB;
BEGIN
    v_id_usuario := NULLIF(current_setting('sacpa.current_user_id', true), '')::INTEGER;
    v_rol_app    := NULLIF(current_setting('sacpa.current_app_role', true), '');

    IF TG_OP = 'DELETE' THEN
        v_anterior := to_jsonb(OLD);
    ELSIF TG_OP = 'UPDATE' THEN
        v_anterior := to_jsonb(OLD);
        v_nuevo    := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        v_nuevo    := to_jsonb(NEW);
    END IF;

    -- Nunca guardar el hash de contraseña en el log de auditoría
    IF TG_TABLE_NAME = 'usuario' THEN
        v_anterior := v_anterior - 'contrasena';
        v_nuevo    := v_nuevo - 'contrasena';
    END IF;

    INSERT INTO seguridad.auditoria
        (id_usuario, accion, tabla_afectada, operacion, descripcion, valor_anterior, valor_nuevo, fecha_hora)
    VALUES (
        v_id_usuario,
        TG_OP,
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        COALESCE(v_rol_app, 'SISTEMA'),
        TG_OP || ' en ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        v_anterior::TEXT,
        v_nuevo::TEXT,
        now()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

GRANT EXECUTE ON FUNCTION seguridad.fn_registrar_auditoria() TO PUBLIC;

-- ------------------------------------------------------------
-- Triggers sobre las tablas de operaciones importantes
-- ------------------------------------------------------------
DO $$
DECLARE
    tablas TEXT[][] := ARRAY[
        ['seguridad', 'usuario'],
        ['seguridad', 'rol_privilegio'],
        ['seguridad', 'usuario_rol'],
        ['entidades', 'clientes'],
        ['entidades', 'proveedor'],
        ['inventario', 'lotes'],
        ['operaciones', 'ventas'],
        ['operaciones', 'detalle_ventas'],
        ['operaciones', 'venta'],
        ['operaciones', 'detalle_venta'],
        ['operaciones', 'uso_campo'],
        ['operaciones', 'movimientos_inventario']
    ];
    i INTEGER;
BEGIN
    FOR i IN 1 .. array_length(tablas, 1) LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_auditoria_%1$s ON %2$I.%1$I',
            tablas[i][2], tablas[i][1]
        );
        EXECUTE format(
            'CREATE TRIGGER trg_auditoria_%1$s AFTER INSERT OR UPDATE OR DELETE ON %2$I.%1$I FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_auditoria()',
            tablas[i][2], tablas[i][1]
        );
    END LOOP;
END $$;
