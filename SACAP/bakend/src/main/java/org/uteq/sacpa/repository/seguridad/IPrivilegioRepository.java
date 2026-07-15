package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.seguridad.Privilegio;

public interface IPrivilegioRepository extends JpaRepository<Privilegio, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_crear_privilegio(:nombrePrivilegio, :descripcion, :idEstado, :idTipoObjeto)", nativeQuery = true)
    void crearPrivilegio(@Param("nombrePrivilegio") String nombrePrivilegio, @Param("descripcion") String descripcion, @Param("idEstado") Integer idEstado, @Param("idTipoObjeto") Integer idTipoObjeto);

    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_actualizar_privilegio(:idPrivilegio, :nuevoNombre, :nuevaDescripcion, :idTipoObjeto)", nativeQuery = true)
    void actualizarPrivilegio(@Param("idPrivilegio") Integer idPrivilegio, @Param("nuevoNombre") String nuevoNombre, @Param("nuevaDescripcion") String nuevaDescripcion, @Param("idTipoObjeto") Integer idTipoObjeto);

    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_desactivar_privilegio(:idPrivilegio)", nativeQuery = true)
    void desactivarPrivilegio(@Param("idPrivilegio") Integer idPrivilegio);
}
