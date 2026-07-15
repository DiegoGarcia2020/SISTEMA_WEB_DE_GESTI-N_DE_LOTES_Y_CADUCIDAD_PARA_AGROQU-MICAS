package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;

import java.time.LocalDate;
import java.util.List;

public interface ITemporadaAgricolaRepository extends JpaRepository<TemporadaAgricola, Integer> {



    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_temporada_agricola(:nombreTemporada, :cultivo, :fechaInicio, :fechaFin, :idEstado)", nativeQuery = true)
    void crearTemporada(@Param("nombreTemporada") String nombreTemporada,
                        @Param("cultivo") String cultivo,
                        @Param("fechaInicio") LocalDate fechaInicio,
                        @Param("fechaFin") LocalDate fechaFin,
                        @Param("idEstado") Integer idEstado);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_actualizar_temporada_agricola(:idTemporada, :nombreTemporada, :cultivo, :fechaInicio, :fechaFin, :idEstado)", nativeQuery = true)
    void actualizarTemporada(@Param("idTemporada") Integer idTemporada,
                             @Param("nombreTemporada") String nombreTemporada,
                             @Param("cultivo") String cultivo,
                             @Param("fechaInicio") LocalDate fechaInicio,
                             @Param("fechaFin") LocalDate fechaFin,
                             @Param("idEstado") Integer idEstado);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_desactivar_temporada_agricola(:idTemporada, :idEstadoInactivo)", nativeQuery = true)
    void desactivarTemporada(@Param("idTemporada") Integer idTemporada, @Param("idEstadoInactivo") Integer idEstadoInactivo);
}
