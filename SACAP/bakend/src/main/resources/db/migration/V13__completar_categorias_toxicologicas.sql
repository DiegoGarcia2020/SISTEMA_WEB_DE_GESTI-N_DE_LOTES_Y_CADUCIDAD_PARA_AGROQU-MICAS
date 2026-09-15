-- catalogos.toxicidad ya existia y estaba conectado a producto (formulario, DTO,
-- endpoint /api/catalogos/toxicidades), pero solo tenia 3 de las 5 bandas OMS/SGA
-- (faltaban Ia y IV), sin codigo formal Ia/Ib/II/III/IV, y sin forma de saber
-- cuales categorias exigen receta agricola segun el Anexo 6 de la Resolucion 0227
-- de AGROCALIDAD (Ia y Ib van con receta firmada por Ing. Agronomo/Agropecuario).
--
-- Tambien hay plaguicidas de venta restringida (Paraquat y sus mezclas,
-- Carbosulfan, etc.) que exigen receta SIN pertenecer necesariamente a Ia/Ib —
-- por eso "venta_restringida" se agrega en el propio producto, no solo en la
-- banda de toxicidad: permite marcar un producto puntual como restringido
-- aunque su categoria OMS no lo exija por si sola.

ALTER TABLE catalogos.toxicidad
    ADD COLUMN codigo_oms VARCHAR(5),
    ADD COLUMN requiere_receta BOOLEAN NOT NULL DEFAULT false;

-- Corrige las 3 bandas existentes con su codigo OMS/SGA real y el color de
-- franja correcto (Rojo: Ia/Ib, Amarillo: II, Azul: III, Verde: IV).
UPDATE catalogos.toxicidad SET codigo_oms = 'II',  color_etiqueta = 'Amarillo', requiere_receta = false WHERE id_toxicidad = 1; -- Moderadamente Tóxico
UPDATE catalogos.toxicidad SET codigo_oms = 'III', color_etiqueta = 'Azul',     requiere_receta = false WHERE id_toxicidad = 2; -- Ligeramente Tóxico
UPDATE catalogos.toxicidad SET codigo_oms = 'Ib',  color_etiqueta = 'Rojo',     requiere_receta = true  WHERE id_toxicidad = 3; -- Altamente Tóxico

-- Bandas que faltaban.
INSERT INTO catalogos.toxicidad (nombre, color_etiqueta, descripcion, codigo_oms, requiere_receta)
SELECT 'Extremadamente Tóxico', 'Rojo',
       'Categoría Ia OMS/SGA. Venta exclusivamente con receta agrícola firmada por Ing. Agrónomo/Agropecuario (AGROCALIDAD Res. 0227, Anexo 6).',
       'Ia', true
WHERE NOT EXISTS (SELECT 1 FROM catalogos.toxicidad WHERE codigo_oms = 'Ia');

INSERT INTO catalogos.toxicidad (nombre, color_etiqueta, descripcion, codigo_oms, requiere_receta)
SELECT 'Normalmente No Tóxico', 'Verde', 'Categoría IV OMS/SGA.', 'IV', false
WHERE NOT EXISTS (SELECT 1 FROM catalogos.toxicidad WHERE codigo_oms = 'IV');

-- Bandera por producto para plaguicidas de venta restringida que no son Ia/Ib
-- por banda OMS pero AGROCALIDAD exige receta igual (ej. Paraquat, Carbosulfán).
ALTER TABLE inventario.producto
    ADD COLUMN venta_restringida BOOLEAN NOT NULL DEFAULT false;
