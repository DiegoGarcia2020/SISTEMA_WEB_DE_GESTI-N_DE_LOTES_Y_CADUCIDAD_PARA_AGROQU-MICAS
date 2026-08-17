-- =============================================================
-- SEED DEMO - Ventas de prueba (Pregunta #1 Dashboard IA)
-- BD: scapa | Usa operaciones.fn_registrar_venta
--
-- Fechas RELATIVAS a la semana en curso: puede re-ejecutarse
-- cualquier semana y la pantalla siempre mostrará datos.
-- Es IDEMPOTENTE: antes de insertar revierte los movimientos de
-- las ventas demo anteriores (DESPACHO VENTA) y las elimina.
--
-- 52 ventas distribuidas en ~6 semanas (foco en la semana actual).
-- NOTA: ejecutar en horario laboral para que las ventas de "hoy"
-- queden dentro del período actual.
-- =============================================================

BEGIN;

DO $$
DECLARE
    v_lunes       DATE := date_trunc('week', CURRENT_DATE)::DATE;
    v_hoy         DATE := CURRENT_DATE;

    v_d0          DATE;  -- lunes (semana actual)
    v_d1          DATE;  -- martes
    v_d2          DATE;
    v_d3          DATE;
    v_d4          DATE;
    v_d5          DATE;
    v_d6          DATE;

    v_sem_anterior DATE;
    v_sem_5        DATE;
    v_sem_4        DATE;
    v_sem_3        DATE;
    v_sem_2        DATE;

    v              RECORD;
    m              RECORD;
BEGIN

    -- ============ LIMPIEZA IDEMPOTENTE ============
    -- Revierte los movimientos DESPACHO VENTA de las ventas demo
    -- anteriores (restaura stock) y las elimina.
    -- (operaciones.detalle_venta se elimina por CASCADE)
    FOR v IN
        SELECT id_venta FROM operaciones.venta
        WHERE cliente IN (
            'AgriAndes Cia. Ltda.', 'Finca La Esperanza', 'Corp. Agroexport S.A.',
            'Arrocera San Luis', 'Banco de Fomento Agr.', 'AgroSoluciones EC',
            'Hda. La Providencia', 'Hda. Los Molinos', 'Finca Santa Rosa',
            'Prueba API', 'Cliente demo 1', 'Cliente demo 2', 'Cliente demo 3',
            'Cliente demo 4', 'Cliente demo 5')
    LOOP
        FOR m IN
            SELECT id_movimiento FROM operaciones.movimientos_inventario
            WHERE observacion LIKE 'Venta #' || v.id_venta || ' - %'
        LOOP
            PERFORM operaciones.fn_anular_movimiento_inventario(m.id_movimiento, 3);
        END LOOP;
        DELETE FROM operaciones.venta WHERE id_venta = v.id_venta;
    END LOOP;

    -- ============ BASES DE FECHA ============
    v_d0 := v_lunes;
    v_d1 := LEAST(v_lunes + 1, v_hoy);
    v_d2 := LEAST(v_lunes + 2, v_hoy);
    v_d3 := LEAST(v_lunes + 3, v_hoy);
    v_d4 := LEAST(v_lunes + 4, v_hoy);
    v_d5 := LEAST(v_lunes + 5, v_hoy);
    v_d6 := LEAST(v_lunes + 6, v_hoy);

    v_sem_anterior := v_lunes - 7;
    v_sem_5        := v_lunes - 14;
    v_sem_4        := v_lunes - 21;
    v_sem_3        := v_lunes - 28;
    v_sem_2        := v_lunes - 35;

    -- ============ SEMANA ACTUAL - 18 ventas ============
    PERFORM operaciones.fn_registrar_venta(1, v_d1 + time '09:30', 'AgriAndes Cia. Ltda.', '[{"id_producto":1,"cantidad":30,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(3, v_d1 + time '11:00', 'Finca La Esperanza', '[{"id_producto":2,"cantidad":20,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(2, v_d2 + time '10:15', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":25,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(3, v_d2 + time '12:40', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":40,"id_lote":10}]');
    PERFORM operaciones.fn_registrar_venta(1, v_d2 + time '16:20', 'Banco de Fomento Agr.', '[{"id_producto":6,"cantidad":15,"id_lote":6}]');
    PERFORM operaciones.fn_registrar_venta(2, v_d3 + time '09:00', 'AgroSoluciones EC', '[{"id_producto":1,"cantidad":20,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(1, v_d3 + time '11:30', 'Hda. La Providencia', '[{"id_producto":4,"cantidad":18,"id_lote":4}]');
    PERFORM operaciones.fn_registrar_venta(3, v_d3 + time '15:10', 'Finca La Esperanza', '[{"id_producto":2,"cantidad":15,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(1, v_d4 + time '10:00', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":25,"id_lote":10}]');
    PERFORM operaciones.fn_registrar_venta(2, v_d4 + time '12:00', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":20,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(3, v_d4 + time '15:45', 'AgroSoluciones EC', '[{"id_producto":1,"cantidad":25,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(1, v_d5 + time '09:30', 'Banco de Fomento Agr.', '[{"id_producto":6,"cantidad":18,"id_lote":6}]');
    PERFORM operaciones.fn_registrar_venta(3, v_d5 + time '11:15', 'Hda. Los Molinos', '[{"id_producto":5,"cantidad":10,"id_lote":5}]');
    PERFORM operaciones.fn_registrar_venta(2, v_d5 + time '14:50', 'AgriAndes Cia. Ltda.', '[{"id_producto":2,"cantidad":18,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(1, v_d6 + time '10:20', 'Finca La Esperanza', '[{"id_producto":1,"cantidad":15,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(3, v_d6 + time '12:30', 'Hda. La Providencia', '[{"id_producto":4,"cantidad":12,"id_lote":4}]');
    PERFORM operaciones.fn_registrar_venta(2, v_d0 + time '09:00', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":15,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(1, v_d0 + time '11:00', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":20,"id_lote":10}]');

    -- ============ SEMANA ANTERIOR - 8 ventas ============
    PERFORM operaciones.fn_registrar_venta(1, v_sem_anterior + time '09:00', 'AgroSoluciones EC', '[{"id_producto":1,"cantidad":12,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_anterior + 1 + time '10:30', 'Finca La Esperanza', '[{"id_producto":2,"cantidad":10,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_anterior + 2 + time '11:00', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":9,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_anterior + 3 + time '09:45', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":12,"id_lote":10}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_anterior + 4 + time '10:15', 'Banco de Fomento Agr.', '[{"id_producto":6,"cantidad":8,"id_lote":6}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_anterior + 4 + time '14:20', 'Hda. La Providencia', '[{"id_producto":4,"cantidad":6,"id_lote":4}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_anterior + 5 + time '10:00', 'AgriAndes Cia. Ltda.', '[{"id_producto":1,"cantidad":8,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_anterior + 6 + time '09:30', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":10,"id_lote":10}]');

    -- ============ SEMANA 5 (hace 2 semanas) - 6 ventas ============
    PERFORM operaciones.fn_registrar_venta(1, v_sem_5 + time '09:00', 'AgriAndes Cia. Ltda.', '[{"id_producto":1,"cantidad":20,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_5 + 1 + time '10:30', 'Finca La Esperanza', '[{"id_producto":2,"cantidad":15,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_5 + 2 + time '11:00', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":12,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_5 + 3 + time '09:45', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":18,"id_lote":10}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_5 + 4 + time '10:15', 'Banco de Fomento Agr.', '[{"id_producto":6,"cantidad":10,"id_lote":6}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_5 + 6 + time '09:30', 'AgroSoluciones EC', '[{"id_producto":1,"cantidad":12,"id_lote":1}]');

    -- ============ SEMANA 4 (hace 3 semanas) - 7 ventas ============
    PERFORM operaciones.fn_registrar_venta(3, v_sem_4 + time '09:00', 'Finca La Esperanza', '[{"id_producto":2,"cantidad":10,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_4 + 1 + time '10:30', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":15,"id_lote":10}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_4 + 2 + time '11:00', 'Hda. Los Molinos', '[{"id_producto":5,"cantidad":8,"id_lote":5}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_4 + 2 + time '15:20', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":10,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_4 + 3 + time '09:45', 'AgroSoluciones EC', '[{"id_producto":1,"cantidad":10,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_4 + 4 + time '10:15', 'Finca Santa Rosa', '[{"id_producto":12,"cantidad":12,"id_lote":12}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_4 + 5 + time '14:20', 'Banco de Fomento Agr.', '[{"id_producto":6,"cantidad":8,"id_lote":6}]');

    -- ============ SEMANA 3 (hace 4 semanas) - 7 ventas ============
    PERFORM operaciones.fn_registrar_venta(1, v_sem_3 + time '09:00', 'AgroSoluciones EC', '[{"id_producto":1,"cantidad":10,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_3 + 1 + time '10:30', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":8,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_3 + 2 + time '11:00', 'Finca La Esperanza', '[{"id_producto":2,"cantidad":8,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_3 + 3 + time '09:45', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":12,"id_lote":10}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_3 + 4 + time '10:15', 'Hda. Los Molinos', '[{"id_producto":3,"cantidad":15,"id_lote":3}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_3 + 5 + time '14:20', 'Hda. La Providencia', '[{"id_producto":4,"cantidad":6,"id_lote":4}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_3 + 6 + time '09:30', 'Finca Santa Rosa', '[{"id_producto":7,"cantidad":10,"id_lote":7}]');

    -- ============ SEMANA 2 (hace 5 semanas) - 6 ventas ============
    PERFORM operaciones.fn_registrar_venta(1, v_sem_2 + time '09:00', 'AgriAndes Cia. Ltda.', '[{"id_producto":1,"cantidad":8,"id_lote":1}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_2 + 1 + time '10:30', 'Arrocera San Luis', '[{"id_producto":10,"cantidad":10,"id_lote":10}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_2 + 2 + time '11:00', 'Banco de Fomento Agr.', '[{"id_producto":6,"cantidad":8,"id_lote":6}]');
    PERFORM operaciones.fn_registrar_venta(1, v_sem_2 + 3 + time '09:45', 'Corp. Agroexport S.A.', '[{"id_producto":9,"cantidad":8,"id_lote":9}]');
    PERFORM operaciones.fn_registrar_venta(3, v_sem_2 + 4 + time '10:15', 'Finca La Esperanza', '[{"id_producto":2,"cantidad":6,"id_lote":2}]');
    PERFORM operaciones.fn_registrar_venta(2, v_sem_2 + 5 + time '14:20', 'Hda. Los Molinos', '[{"id_producto":8,"cantidad":10,"id_lote":8}]');

    RAISE NOTICE 'Seed demo de ventas aplicado para la semana que inicia el %', v_lunes;
END $$;

COMMIT;
