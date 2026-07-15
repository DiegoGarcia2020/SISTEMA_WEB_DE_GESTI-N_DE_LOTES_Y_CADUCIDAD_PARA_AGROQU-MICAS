package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.seguridad.Usuario;

import java.util.Optional;

public interface IUsuarioRepository extends JpaRepository<Usuario, Integer> {

    /**
     * Busca usuario por correo electronico, cargando sus roles y el rol de BD asociado.
     * Usado por SecurityConfig para autenticacion JWT.
     */
    @Query("""
        SELECT u FROM Usuario u
        LEFT JOIN FETCH u.roles ur
        LEFT JOIN FETCH ur.rol r
        LEFT JOIN FETCH r.rolBD
        WHERE u.correo = :correo
    """)
    Optional<Usuario> findByCorreoWithRoles(@Param("correo") String correo);

    Optional<Usuario> findByCorreo(String correo);

    /**
     * Cambia la contrasena de un usuario usando la funcion PL/pgSQL.
     * Funcion BD: seguridad.fn_actualizar_contrasena(p_id_usuario, p_nueva_contrasena)
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "SELECT seguridad.fn_actualizar_contrasena(:idUsuario, :nuevaContrasena)", nativeQuery = true)
    void actualizarContrasena(@Param("idUsuario") Integer idUsuario, @Param("nuevaContrasena") String nuevaContrasena);

    /**
     * Eliminacion logica del usuario.
     * Funcion BD: seguridad.fn_eliminacion_logica_usuario(p_id_usuario, p_id_estado_inactivo)
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "SELECT seguridad.fn_eliminacion_logica_usuario(:idUsuario, :idEstadoInactivo)", nativeQuery = true)
    void eliminarLogicamente(@Param("idUsuario") Integer idUsuario, @Param("idEstadoInactivo") Integer idEstadoInactivo);
}
