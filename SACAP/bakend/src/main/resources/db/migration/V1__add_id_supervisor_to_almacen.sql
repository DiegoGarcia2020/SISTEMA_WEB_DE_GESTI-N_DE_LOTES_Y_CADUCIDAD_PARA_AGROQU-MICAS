ALTER TABLE inventario.almacen
ADD COLUMN IF NOT EXISTS id_supervisor INTEGER REFERENCES inventario.supervisor(id_supervisor);
