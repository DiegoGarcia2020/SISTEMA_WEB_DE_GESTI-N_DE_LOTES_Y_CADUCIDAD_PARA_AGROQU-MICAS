-- Checklist AGROCALIDAD (Resolucion 0227, Anexo 1, punto 17): "sistema de asignacion de
-- ubicaciones considera incompatibilidad quimica entre productos almacenados". El sistema
-- ya validaba capacidad fisica de la ubicacion, pero no impedia poner un plaguicida junto a
-- fertilizantes o semillas en el mismo estante -- riesgo real de contaminacion cruzada que
-- FAO/AGROCALIDAD exige segregar (los plaguicidas deben almacenarse separados de semillas,
-- fertilizantes y alimentos).
--
-- Se clasifica cada categoria comercial existente en un grupo de almacenamiento amplio.
-- No se modela una matriz N x N de incompatibilidad quimica fina (requeriria clasificar
-- cada ingrediente activo por grupo NTE INEN 2266, dato que no existe hoy en el sistema);
-- la regla que se aplica es la de segregacion mas basica y mejor establecida: PLAGUICIDA
-- no puede compartir ubicacion fisica con FERTILIZANTE ni con SEMILLA.

ALTER TABLE inventario.categoria
    ADD COLUMN grupo_almacenamiento VARCHAR(30);

UPDATE inventario.categoria SET grupo_almacenamiento = 'FERTILIZANTE' WHERE LOWER(nombre) LIKE '%fertilizante%';
UPDATE inventario.categoria SET grupo_almacenamiento = 'SEMILLA' WHERE LOWER(nombre) LIKE '%semilla%';
UPDATE inventario.categoria SET grupo_almacenamiento = 'PLAGUICIDA'
    WHERE grupo_almacenamiento IS NULL
      AND (LOWER(nombre) LIKE '%herbicida%' OR LOWER(nombre) LIKE '%insecticida%'
           OR LOWER(nombre) LIKE '%fungicida%' OR LOWER(nombre) LIKE '%plaguicida%'
           OR LOWER(nombre) LIKE '%acaricida%' OR LOWER(nombre) LIKE '%nematicida%');

COMMENT ON COLUMN inventario.categoria.grupo_almacenamiento IS
    'Grupo amplio de segregacion fisica en bodega: PLAGUICIDA, FERTILIZANTE, SEMILLA u otro/nulo (sin restriccion). PLAGUICIDA no puede compartir ubicacion fisica con FERTILIZANTE ni SEMILLA.';
