package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.seguridad.RolBD;

public interface IRolBDRepository extends JpaRepository<RolBD, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_crear_rol_bd(:nombreRolBd, :descripcion, :idEstado)", nativeQuery = true)
    void crearRolBd(@Param("nombreRolBd") String nombreRolBd, @Param("descripcion") String descripcion, @Param("idEstado") Integer idEstado);

    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_actualizar_rol_bd(:idRolBd, :nuevoNombre, :nuevaDescripcion)", nativeQuery = true)
    void actualizarRolBd(@Param("idRolBd") Integer idRolBd, @Param("nuevoNombre") String nuevoNombre, @Param("nuevaDescripcion") String nuevaDescripcion);

    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_desactivar_rol_bd(:idRolBd)", nativeQuery = true)
    void desactivarRolBd(@Param("idRolBd") Integer idRolBd);
}
