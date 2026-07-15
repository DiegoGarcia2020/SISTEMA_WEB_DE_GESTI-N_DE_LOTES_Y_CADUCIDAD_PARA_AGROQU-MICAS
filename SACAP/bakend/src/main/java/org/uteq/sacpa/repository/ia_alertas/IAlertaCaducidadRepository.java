package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.AlertaCaducidad;

import java.util.List;

/**
 * Repositorio CORE del sistema SACPA.
 * Maneja las alertas de caducidad y llama funciones PL/pgSQL del esquema ia_alertas.
 */
public interface IAlertaCaducidadRepository extends JpaRepository<AlertaCaducidad, Integer> {

    /** Alertas activas (no descartadas) */
    @Query("SELECT a FROM AlertaCaducidad a JOIN FETCH a.lote l JOIN FETCH a.nivelAlerta n WHERE a.idEstado = :idEstadoActivo ORDER BY l.fechaVencimiento ASC")
    List<AlertaCaducidad> findAlertasActivas(@Param("idEstadoActivo") Integer idEstadoActivo);

    /** Alertas por nivel */
    @Query("SELECT a FROM AlertaCaducidad a WHERE a.nivelAlerta.idNivelAlerta = :idNivel AND a.idEstado = :idEstado")
    List<AlertaCaducidad> findByNivelYEstado(@Param("idNivel") Integer idNivel, @Param("idEstado") Integer idEstado);

    /** Alertas por lote */
    List<AlertaCaducidad> findByLote_IdLote(Integer idLote);

    // ============================================================
    // Llamadas a funciones PL/pgSQL del esquema ia_alertas
    // ============================================================

    /**
     * Crea una alerta de caducidad.
     * Funcion BD: ia_alertas.fn_crear_alerta_caducidad(p_mensaje, p_id_lote, p_id_nivel_alerta, p_id_estado)
     */
    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_alerta_caducidad(:mensaje, :idLote, :idNivelAlerta, :idEstado)", nativeQuery = true)
    void crearAlerta(@Param("mensaje") String mensaje,
                     @Param("idLote") Integer idLote,
                     @Param("idNivelAlerta") Integer idNivelAlerta,
                     @Param("idEstado") Integer idEstado);

    /**
     * Descarta una alerta.
     * Funcion BD: ia_alertas.fn_descartar_alerta_caducidad(p_id_alerta, p_id_estado_descartado)
     */
    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_descartar_alerta_caducidad(:idAlerta, :idEstadoDescartado)", nativeQuery = true)
    void descartarAlerta(@Param("idAlerta") Integer idAlerta, @Param("idEstadoDescartado") Integer idEstadoDescartado);
}
