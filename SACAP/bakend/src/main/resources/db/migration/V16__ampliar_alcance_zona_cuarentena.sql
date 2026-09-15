-- Checklist AGROCALIDAD (Resolucion 0227, Anexo 1, punto 12): la zona de cuarentena debe
-- segregar FISICAMENTE cualquier producto retenido -- no solo el de empaque danado.
--
-- Antes de esto, DevolucionVentaServiceImpl.recibirDevolucionFisica solo asignaba una
-- ubicacion fisica cuando estadoInventario = EMPAQUE_DANADO; una devolucion marcada
-- CUARENTENA (a la espera de revision tecnica/de calidad) no quedaba en ningun lugar --
-- el producto "desaparecia" del sistema sin trazabilidad de donde esta fisicamente
-- mientras se revisa.

ALTER TABLE operaciones.devoluciones_venta
    ADD COLUMN id_ubicacion_cuarentena INTEGER REFERENCES inventario.ubicacion_interna(id_ubicacion);

COMMENT ON COLUMN operaciones.devoluciones_venta.id_ubicacion_cuarentena IS
    'Ubicacion fisica (dentro de una zona con es_cuarentena=true) donde queda retenido el producto en estado CUARENTENA o DESECHADO, para trazabilidad mientras se revisa o se dispone su baja.';
