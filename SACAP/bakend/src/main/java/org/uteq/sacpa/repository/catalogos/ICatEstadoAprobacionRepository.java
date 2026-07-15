package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.catalogos.CatEstadoAprobacion;

public interface ICatEstadoAprobacionRepository extends JpaRepository<CatEstadoAprobacion, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_crear_estado_aprobacion(:nombre)", nativeQuery = true)
    void crearEstado(@Param("nombre") String nombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_actualizar_estado_aprobacion(:idEstadoAprobacion, :nuevoNombre)", nativeQuery = true)
    void actualizarEstado(@Param("idEstadoAprobacion") Integer idEstadoAprobacion, @Param("nuevoNombre") String nuevoNombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_desactivar_estado_aprobacion(:idEstadoAprobacion)", nativeQuery = true)
    void desactivarEstado(@Param("idEstadoAprobacion") Integer idEstadoAprobacion);
}
