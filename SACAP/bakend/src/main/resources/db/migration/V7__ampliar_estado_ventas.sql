-- El estado 'DEVUELTA_PARCIALMENTE' (21 caracteres) no cabe en el
-- VARCHAR(20) original de operaciones.ventas.estado, lo que rompía
-- el registro de devoluciones en campo con "value too long for type
-- character varying(20)".
ALTER TABLE operaciones.ventas ALTER COLUMN estado TYPE VARCHAR(30);
