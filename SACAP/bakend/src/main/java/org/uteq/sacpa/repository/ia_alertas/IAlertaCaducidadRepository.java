package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.ia_alertas.AlertaCaducidad;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * Repositorio CORE del sistema SACPA.
 * Maneja las alertas de caducidad. Las escrituras (crear/descartar) se hacen vía
 * JdbcTemplate en el servicio — ver AlertaCaducidadServiceImpl.
 */
public interface IAlertaCaducidadRepository extends JpaRepository<AlertaCaducidad, Integer> {

    /** Alertas activas (no descartadas) */
    @Query(value = "SELECT a FROM AlertaCaducidad a JOIN FETCH a.lote l JOIN FETCH a.nivelAlerta n WHERE a.estado.idEstadoAlerta = :idEstadoActivo ORDER BY l.fechaVencimiento ASC",
           countQuery = "SELECT count(a) FROM AlertaCaducidad a WHERE a.estado.idEstadoAlerta = :idEstadoActivo")
    Page<AlertaCaducidad> findAlertasActivas(@Param("idEstadoActivo") Integer idEstadoActivo, Pageable pageable);

    /** Alertas por nivel */
    @Query("SELECT a FROM AlertaCaducidad a WHERE a.nivelAlerta.idNivelAlerta = :idNivel AND a.estado.idEstadoAlerta = :idEstado")
    List<AlertaCaducidad> findByNivelYEstado(@Param("idNivel") Integer idNivel, @Param("idEstado") Integer idEstado);

    /** Alertas por lote */
    List<AlertaCaducidad> findByLote_IdLote(Integer idLote);
}
