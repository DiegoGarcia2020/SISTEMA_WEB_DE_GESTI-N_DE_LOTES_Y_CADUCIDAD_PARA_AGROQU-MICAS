package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;

import java.util.List;

public interface IMovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Integer> {

    List<MovimientoInventario> findByLote_IdLote(Integer idLote);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_crear_movimiento_inventario(:cantidad, :observacion, :idLote, :idTipoMovimiento, :idUsuario, :idEstadoAprobacion)", nativeQuery = true)
    void crearMovimiento(@Param("cantidad") Integer cantidad,
                         @Param("observacion") String observacion,
                         @Param("idLote") Integer idLote,
                         @Param("idTipoMovimiento") Integer idTipoMovimiento,
                         @Param("idUsuario") Integer idUsuario,
                         @Param("idEstadoAprobacion") Integer idEstadoAprobacion);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_actualizar_movimiento_inventario(:idMovimiento, :observacion, :idEstadoAprobacion)", nativeQuery = true)
    void actualizarMovimiento(@Param("idMovimiento") Integer idMovimiento,
                              @Param("observacion") String observacion,
                              @Param("idEstadoAprobacion") Integer idEstadoAprobacion);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_anular_movimiento_inventario(:idMovimiento, :idEstadoAnulado)", nativeQuery = true)
    void anularMovimiento(@Param("idMovimiento") Integer idMovimiento,
                          @Param("idEstadoAnulado") Integer idEstadoAnulado);
}
