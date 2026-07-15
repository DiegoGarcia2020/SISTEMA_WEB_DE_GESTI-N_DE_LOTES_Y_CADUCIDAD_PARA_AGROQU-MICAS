package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.catalogos.CatEstadoGeneral;

public interface ICatEstadoGeneralRepository extends JpaRepository<CatEstadoGeneral, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_crear_estado_general(:nombre)", nativeQuery = true)
    void crearEstado(@Param("nombre") String nombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_actualizar_estado_general(:idEstado, :nuevoNombre)", nativeQuery = true)
    void actualizarEstado(@Param("idEstado") Integer idEstado, @Param("nuevoNombre") String nuevoNombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_desactivar_estado_general(:idEstado)", nativeQuery = true)
    void desactivarEstado(@Param("idEstado") Integer idEstado);
}
