-- El bodeguero no tenia forma de saber a que bodega pertenece: cualquier
-- bodeguero veia todas. Se agrega FK opcional (nace en NULL) para que el
-- Supervisor la asigne desde la UI ("Mi Equipo").
ALTER TABLE inventario.bodeguero
    ADD COLUMN id_almacen INTEGER REFERENCES inventario.almacen(id_almacen);

CREATE INDEX idx_bodeguero_id_almacen ON inventario.bodeguero(id_almacen);
