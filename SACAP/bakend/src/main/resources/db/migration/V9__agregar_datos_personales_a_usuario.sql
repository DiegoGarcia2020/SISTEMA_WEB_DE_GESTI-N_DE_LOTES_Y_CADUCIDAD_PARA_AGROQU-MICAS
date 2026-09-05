-- Los datos personales (nombres, apellidos, cedula, telefono, ocupacion)
-- se pedian en el formulario de "Crear Usuario" pero Usuario.java los
-- marcaba @Transient: nunca se guardaban, y por eso al "Asignar Rol"
-- el backend no tenia de donde sacar el nombre real y usaba un
-- valor fijo ("Supervisor"/"SACPA", "Tecnico"/"SACPA").
--
-- Con estas columnas, el nombre ingresado en el Paso 1 (crear usuario)
-- sobrevive hasta el Paso 2 (asignar rol), donde se copia a la tabla
-- especifica del rol (Supervisor / TecnicoCampo / Administrador).

ALTER TABLE seguridad.usuario
    ADD COLUMN nombres    VARCHAR(150),
    ADD COLUMN apellidos  VARCHAR(150),
    ADD COLUMN cedula     VARCHAR(20),
    ADD COLUMN telefono   VARCHAR(30),
    ADD COLUMN ocupacion  VARCHAR(150);
