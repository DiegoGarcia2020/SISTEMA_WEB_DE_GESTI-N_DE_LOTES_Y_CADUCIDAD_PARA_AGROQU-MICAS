-- Cierra el flujo de Pedidos (operaciones.uso_campo, tipo_registro='ORDEN_PEDIDO'):
-- PENDIENTE_BODEGA(1) -> DESPACHADO(2) -> ENTREGADO(3), sin estado "Recibido" intermedio.
-- Hasta ahora solo existía fn_despachar_pedido (PENDIENTE_BODEGA -> DESPACHADO); esta función
-- cierra el último paso, que confirma el Técnico al entregar en destino al cliente.
CREATE OR REPLACE FUNCTION operaciones.fn_entregar_pedido(p_id_uso integer)
  RETURNS void
  LANGUAGE plpgsql
AS $function$
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
$function$;
