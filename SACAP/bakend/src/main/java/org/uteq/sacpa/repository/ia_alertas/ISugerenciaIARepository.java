package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;

import java.math.BigDecimal;
import java.util.List;

public interface ISugerenciaIARepository extends JpaRepository<SugerenciaIA, Integer> {

    List<SugerenciaIA> findByLote_IdLote(Integer idLote);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_sugerencia_ia(:porcentajeDescuento, :observaciones, :idLote, :idTemporada, :idEjecucion, :idEstadoAprobacion)", nativeQuery = true)
    void crearSugerencia(@Param("porcentajeDescuento") BigDecimal porcentajeDescuento,
                         @Param("observaciones") String observaciones,
                         @Param("idLote") Integer idLote,
                         @Param("idTemporada") Integer idTemporada,
                         @Param("idEjecucion") Integer idEjecucion,
                         @Param("idEstadoAprobacion") Integer idEstadoAprobacion);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_actualizar_estado_sugerencia_ia(:idSugerencia, :idEstadoAprobacion)", nativeQuery = true)
    void actualizarEstado(@Param("idSugerencia") Integer idSugerencia,
                          @Param("idEstadoAprobacion") Integer idEstadoAprobacion);
}
