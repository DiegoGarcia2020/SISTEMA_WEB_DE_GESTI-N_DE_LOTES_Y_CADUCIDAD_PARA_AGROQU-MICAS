package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.seguridad.TipoObjetoSeguridad;

public interface ITipoObjetoSeguridadRepository extends JpaRepository<TipoObjetoSeguridad, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_crear_tipo_objeto_seguridad(:nombre, :descripcion)", nativeQuery = true)
    void crearTipoObjeto(@Param("nombre") String nombre, @Param("descripcion") String descripcion);

    @Modifying @Transactional
    @Query(value = "SELECT seguridad.fn_desactivar_tipo_objeto_seguridad(:idTipoObjeto)", nativeQuery = true)
    void desactivarTipoObjeto(@Param("idTipoObjeto") Integer idTipoObjeto);
}
