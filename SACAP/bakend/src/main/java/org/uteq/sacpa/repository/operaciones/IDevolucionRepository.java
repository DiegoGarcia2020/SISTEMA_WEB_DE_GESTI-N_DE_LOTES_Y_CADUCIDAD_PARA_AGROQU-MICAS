package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.operaciones.Devolucion;

import java.util.List;

public interface IDevolucionRepository extends JpaRepository<Devolucion, Integer> {

    List<Devolucion> findByLote_IdLote(Integer idLote);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_crear_devolucion(:motivo, :cantidad, :idLote, :idProveedor, :idUsuarioSupervisor, :idEstadoAprobacion)", nativeQuery = true)
    void crearDevolucion(@Param("motivo") String motivo,
                         @Param("cantidad") Integer cantidad,
                         @Param("idLote") Integer idLote,
                         @Param("idProveedor") Integer idProveedor,
                         @Param("idUsuarioSupervisor") Integer idUsuarioSupervisor,
                         @Param("idEstadoAprobacion") Integer idEstadoAprobacion);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_aprobar_devolucion(:idDevolucion, :idEstadoAprobado)", nativeQuery = true)
    void aprobarDevolucion(@Param("idDevolucion") Integer idDevolucion,
                           @Param("idEstadoAprobado") Integer idEstadoAprobado);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_anular_devolucion(:idDevolucion, :idEstadoAnulado, :idEstadoAprobadoRef)", nativeQuery = true)
    void anularDevolucion(@Param("idDevolucion") Integer idDevolucion,
                          @Param("idEstadoAnulado") Integer idEstadoAnulado,
                          @Param("idEstadoAprobadoRef") Integer idEstadoAprobadoRef);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_actualizar_devolucion(:idDevolucion, :motivo)", nativeQuery = true)
    void actualizarDevolucion(@Param("idDevolucion") Integer idDevolucion,
                              @Param("motivo") String motivo);
}
