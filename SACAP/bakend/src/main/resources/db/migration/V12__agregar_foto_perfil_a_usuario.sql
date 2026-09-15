-- La entidad Administrador.java tiene foto_perfil pero esa columna nunca se
-- creo en gerencia.administrador -> cada PATCH /api/administrador/perfil/{id}/foto
-- fallaba con "column a1_0.foto_perfil does not exist" (500), y el frontend
-- se quedaba silenciosamente con la foto anterior (el error solo se ve en
-- un toast facil de perder).
--
-- Ademas ese endpoint solo existia para el rol Administrador: un Bodeguero,
-- Supervisor o Tecnico de Campo no tenian a donde guardar su propia foto.
--
-- En vez de repetir la columna en las 4 tablas de rol (inventario.bodeguero,
-- inventario.supervisor, operaciones.tecnico_campo, gerencia.administrador),
-- se agrega una sola vez en seguridad.usuario -- la tabla que SI tiene una
-- fila por cada cuenta sin importar el rol -- junto con los datos
-- personales que V9 ya agrego ahi. El nuevo modulo "Mi Perfil"
-- (PerfilController) lee/escribe desde aqui para cualquier rol autenticado.

ALTER TABLE seguridad.usuario
    ADD COLUMN foto_perfil TEXT;
