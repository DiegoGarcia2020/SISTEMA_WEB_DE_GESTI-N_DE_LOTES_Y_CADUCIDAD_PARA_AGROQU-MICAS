package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.seguridad.Rol;

public interface IRolRepository extends JpaRepository<Rol, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_crear_rol(:nombreRol, :descripcion, :idRolBd, :idEstado)", nativeQuery = true)
    void crearRol(@Param("nombreRol") String nombreRol, @Param("descripcion") String descripcion, @Param("idRolBd") Integer idRolBd, @Param("idEstado") Integer idEstado);
}
