package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.Notificacion;

import java.util.List;

public interface INotificacionRepository extends JpaRepository<Notificacion, Integer> {

    List<Notificacion> findByUsuarioDestino_IdUsuarioOrderByFechaEnvioDesc(Integer idUsuario);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_notificacion(:canal, :idAlerta, :idUsuarioDestino)", nativeQuery = true)
    void crearNotificacion(@Param("canal") String canal,
                           @Param("idAlerta") Integer idAlerta,
                           @Param("idUsuarioDestino") Integer idUsuarioDestino);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_registrar_lectura_notificacion(:idNotificacion)", nativeQuery = true)
    void registrarLectura(@Param("idNotificacion") Integer idNotificacion);
}
