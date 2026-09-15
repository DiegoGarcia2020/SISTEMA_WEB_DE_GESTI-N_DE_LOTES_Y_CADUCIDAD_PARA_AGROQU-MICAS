-- ============================================================
-- ROLES DE BASE DE DATOS Y RBAC — reconstruido a partir de la Tabla 4/5
-- del informe academico (seccion 5) y de los nombres que realmente exige
-- en runtime DatabaseRoleAspect.java (SET LOCAL ROLE "agro_X" por request).
--
-- Nota: el informe describe un esquema de dos niveles (rol de grupo NOLOGIN
-- + usuario de conexion LOGIN que hereda por membresia). La app actual no
-- necesita el nivel de usuario de conexion porque el pool JDBC conecta
-- siempre como el mismo usuario (hoy "postgres") y el aspecto cambia de
-- rol con SET LOCAL ROLE dentro de la misma conexion — eso funciona sin
-- usuarios de login adicionales. Se documenta aqui por si en el futuro
-- se separa el usuario de conexion del superusuario.
--
-- Corre DESPUES de 01_schema.sql (por eso el prefijo 02_): necesita que
-- los 8 esquemas y sus tablas ya existan para poder otorgar privilegios
-- sobre ellos.
--
-- Idempotente: se puede correr varias veces sin duplicar ni fallar.
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agro_administrador') THEN
        CREATE ROLE agro_administrador NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agro_bodeguero') THEN
        CREATE ROLE agro_bodeguero NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agro_supervisor') THEN
        CREATE ROLE agro_supervisor NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agro_tecnico_campo') THEN
        CREATE ROLE agro_tecnico_campo NOLOGIN;
    END IF;
END
$$;

-- ── Principio de minimo privilegio: nadie ve nada por defecto ──
REVOKE ALL ON SCHEMA seguridad, catalogos, geografia, entidades,
                     inventario, operaciones, ia_alertas
    FROM PUBLIC;

-- ============================================================
-- ADMINISTRADOR — control total (Tabla 5: ALL en los 7 esquemas)
-- ============================================================
GRANT USAGE ON SCHEMA seguridad, catalogos, geografia, entidades,
                      inventario, operaciones, ia_alertas
    TO agro_administrador;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA seguridad     TO agro_administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA catalogos     TO agro_administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA geografia     TO agro_administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA entidades     TO agro_administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA inventario    TO agro_administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA operaciones   TO agro_administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ia_alertas    TO agro_administrador;

-- Para que las tablas que cree Flyway en migraciones futuras (V12+)
-- tambien queden accesibles sin correr este script a mano otra vez
-- (limitacion admitida en la seccion 9.1 del informe).
ALTER DEFAULT PRIVILEGES IN SCHEMA seguridad, catalogos, geografia, entidades,
                                    inventario, operaciones, ia_alertas
    GRANT ALL PRIVILEGES ON TABLES TO agro_administrador;

-- ============================================================
-- BODEGUERO — catalogos/entidades de solo lectura; inventario
-- de lectura-escritura; operaciones de lectura+alta (Tabla 5)
-- ============================================================
GRANT USAGE ON SCHEMA catalogos, entidades, inventario, operaciones, ia_alertas
    TO agro_bodeguero;

GRANT SELECT ON ALL TABLES IN SCHEMA catalogos  TO agro_bodeguero;
GRANT SELECT ON ALL TABLES IN SCHEMA entidades  TO agro_bodeguero;
GRANT SELECT ON ALL TABLES IN SCHEMA ia_alertas TO agro_bodeguero;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA inventario  TO agro_bodeguero;
GRANT SELECT, INSERT         ON ALL TABLES IN SCHEMA operaciones TO agro_bodeguero;

ALTER DEFAULT PRIVILEGES IN SCHEMA catalogos, entidades, ia_alertas
    GRANT SELECT ON TABLES TO agro_bodeguero;
ALTER DEFAULT PRIVILEGES IN SCHEMA inventario
    GRANT SELECT, INSERT, UPDATE ON TABLES TO agro_bodeguero;
ALTER DEFAULT PRIVILEGES IN SCHEMA operaciones
    GRANT SELECT, INSERT ON TABLES TO agro_bodeguero;

-- ============================================================
-- SUPERVISOR — lectura de catalogos/inventario; en operaciones e
-- ia_alertas puede APROBAR pero no tocar cantidades ya registradas
-- por el bodeguero: UPDATE restringido a la columna de aprobacion
-- (ejemplo textual de la seccion 5.3 del informe, casos CP-02).
-- ============================================================
GRANT USAGE ON SCHEMA catalogos, inventario, operaciones, ia_alertas
    TO agro_supervisor;

GRANT SELECT ON ALL TABLES IN SCHEMA catalogos    TO agro_supervisor;
GRANT SELECT ON ALL TABLES IN SCHEMA inventario   TO agro_supervisor;
GRANT SELECT ON ALL TABLES IN SCHEMA operaciones  TO agro_supervisor;
GRANT SELECT ON ALL TABLES IN SCHEMA ia_alertas   TO agro_supervisor;

GRANT UPDATE (id_estado_aprobacion)
    ON operaciones.movimientos_inventario TO agro_supervisor;
GRANT UPDATE (id_estado_aprobacion)
    ON ia_alertas.sugerencias_ia TO agro_supervisor;

ALTER DEFAULT PRIVILEGES IN SCHEMA catalogos, inventario, operaciones, ia_alertas
    GRANT SELECT ON TABLES TO agro_supervisor;

-- ============================================================
-- TECNICO DE CAMPO — solo ve disponibilidad y registra uso en
-- parcela. Sin acceso a ia_alertas (caso de prueba CP-03: debe
-- fallar con "permission denied for schema ia_alertas", por eso
-- ni siquiera se le da USAGE sobre ese esquema).
-- ============================================================
GRANT USAGE ON SCHEMA inventario, operaciones
    TO agro_tecnico_campo;

GRANT SELECT ON ALL TABLES IN SCHEMA inventario  TO agro_tecnico_campo;
GRANT SELECT ON ALL TABLES IN SCHEMA operaciones TO agro_tecnico_campo;
GRANT INSERT ON operaciones.uso_campo            TO agro_tecnico_campo;

ALTER DEFAULT PRIVILEGES IN SCHEMA inventario, operaciones
    GRANT SELECT ON TABLES TO agro_tecnico_campo;
