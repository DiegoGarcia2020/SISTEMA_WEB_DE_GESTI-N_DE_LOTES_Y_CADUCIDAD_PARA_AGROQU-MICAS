-- No existía forma de marcar una zona/estantería como exclusiva para productos
-- con empaque dañado: al recibir una devolución con ese estado, el bodeguero
-- podía elegir CUALQUIER ubicación del almacén (incluida la de stock normal),
-- mezclando producto dañado con producto sano. Se agrega el flag y se crea una
-- zona de cuarentena en cada almacén existente para que la UI tenga a dónde
-- destinarlo de inmediato.
ALTER TABLE inventario.zona_almacen
    ADD COLUMN es_cuarentena BOOLEAN NOT NULL DEFAULT false;

INSERT INTO inventario.zona_almacen (nombre, condicion_climatica, id_estado, id_almacen, es_cuarentena)
SELECT 'Zona Cuarentena - Empaque Dañado', 'Cuarentena / Revisión', 1, a.id_almacen, true
FROM inventario.almacen a
WHERE NOT EXISTS (
    SELECT 1 FROM inventario.zona_almacen z
    WHERE z.id_almacen = a.id_almacen AND z.es_cuarentena = true
);

INSERT INTO inventario.estanteria (codigo, id_estado, id_zona)
SELECT 'EST-CUAR-1', 1, z.id_zona
FROM inventario.zona_almacen z
WHERE z.es_cuarentena = true
  AND NOT EXISTS (
      SELECT 1 FROM inventario.estanteria e WHERE e.id_zona = z.id_zona
  );

INSERT INTO inventario.ubicacion_interna (nivel, posicion, capacidad_maxima, id_estado, id_estanteria)
SELECT '1', 'A', 200, 1, e.id_estanteria
FROM inventario.estanteria e
JOIN inventario.zona_almacen z ON z.id_zona = e.id_zona
WHERE z.es_cuarentena = true
  AND NOT EXISTS (
      SELECT 1 FROM inventario.ubicacion_interna u WHERE u.id_estanteria = e.id_estanteria
  );
