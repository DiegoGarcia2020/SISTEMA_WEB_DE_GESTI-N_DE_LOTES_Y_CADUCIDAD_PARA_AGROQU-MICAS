package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.catalogos.CatEstadoLote;

public interface ICatEstadoLoteRepository extends JpaRepository<CatEstadoLote, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_crear_estado_lote(:nombre)", nativeQuery = true)
    void crearEstado(@Param("nombre") String nombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_actualizar_estado_lote(:idEstadoLote, :nuevoNombre)", nativeQuery = true)
    void actualizarEstado(@Param("idEstadoLote") Integer idEstadoLote, @Param("nuevoNombre") String nuevoNombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_desactivar_estado_lote(:idEstadoLote)", nativeQuery = true)
    void desactivarEstado(@Param("idEstadoLote") Integer idEstadoLote);
}
