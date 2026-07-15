package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.catalogos.CatTipoMovimiento;

public interface ICatTipoMovimientoRepository extends JpaRepository<CatTipoMovimiento, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_crear_tipo_movimiento(:nombre, :naturaleza)", nativeQuery = true)
    void crearTipoMovimiento(@Param("nombre") String nombre, @Param("naturaleza") String naturaleza);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_actualizar_tipo_movimiento(:idTipoMovimiento, :nuevoNombre, :nuevaNaturaleza)", nativeQuery = true)
    void actualizarTipoMovimiento(@Param("idTipoMovimiento") Integer idTipoMovimiento, @Param("nuevoNombre") String nuevoNombre, @Param("nuevaNaturaleza") String nuevaNaturaleza);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_desactivar_tipo_movimiento(:idTipoMovimiento)", nativeQuery = true)
    void desactivarTipoMovimiento(@Param("idTipoMovimiento") Integer idTipoMovimiento);
}
