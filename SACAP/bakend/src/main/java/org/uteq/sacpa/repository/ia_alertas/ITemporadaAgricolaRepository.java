package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;

import java.time.LocalDate;
import java.util.List;

public interface ITemporadaAgricolaRepository extends JpaRepository<TemporadaAgricola, Integer> {

    /** Temporadas vigentes hoy y en estado activo — usadas por el Motor de Sugerencias (Variable B) */
    @Query("SELECT t FROM TemporadaAgricola t WHERE t.fechaInicio <= :hoy AND t.fechaFin >= :hoy AND t.estado.idEstadoTemporada = :idEstadoActivo")
    List<TemporadaAgricola> findActivasEnFecha(@Param("hoy") LocalDate hoy, @Param("idEstadoActivo") Integer idEstadoActivo);

    /** La temporada recién creada (mayor id) — el insert se hace vía JdbcTemplate en el servicio */
    TemporadaAgricola findTopByOrderByIdTemporadaDesc();
}
