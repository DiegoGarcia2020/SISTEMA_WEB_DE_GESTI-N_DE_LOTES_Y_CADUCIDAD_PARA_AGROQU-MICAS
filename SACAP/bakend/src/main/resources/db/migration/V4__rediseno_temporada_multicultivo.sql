-- Añadir la columna id_cultivo a la tabla temporada en operaciones
ALTER TABLE operaciones.temporada
ADD COLUMN id_cultivo INTEGER NULL REFERENCES catalogos.cat_cultivo(id_cultivo);

-- NULL = temporada general, no atada a un cultivo específico

-- Migrar datos existentes de ia_alertas.temporadas_agricolas hacia operaciones.temporada
-- intentando emparejar TemporadaAgricola.cultivo contra catalogos.cat_cultivo.nombre.
-- Se insertan en operaciones.temporada.
-- Asumimos que id_estado 1 es ACTIVA, si no, se inserta con estado según corresponda.
-- Si hay datos, los migramos.
-- (Este paso puede generar log manual si no hay coincidencia, aquí hacemos el mapeo básico).

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM ia_alertas.temporadas_agricolas LOOP
        -- Nota: operaciones.temporada espera 'estado' como VARCHAR. Mapearemos id_estado = 1 a 'ACTIVA', etc.
        INSERT INTO operaciones.temporada (
            nombre,
            fecha_inicio,
            fecha_fin,
            estado,
            fecha_creacion,
            id_cultivo
        ) VALUES (
            r.nombre_temporada,
            r.fecha_inicio,
            r.fecha_fin,
            CASE WHEN r.id_estado = 1 THEN 'ACTIVA' ELSE 'INACTIVA' END,
            CURRENT_TIMESTAMP,
            r.id_cultivo
        );
    END LOOP;
END $$;
