package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.ConfiguracionAlerta;

import java.util.Optional;

public interface IConfiguracionAlertaRepository extends JpaRepository<ConfiguracionAlerta, Integer> {

    Optional<ConfiguracionAlerta> findByNivelAlerta_IdNivelAlerta(Integer idNivelAlerta);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_configuracion_alerta(:idNivelAlerta, :diasAnticipacion, :idUsuarioModificador)", nativeQuery = true)
    void crearConfiguracion(@Param("idNivelAlerta") Integer idNivelAlerta,
                            @Param("diasAnticipacion") Integer diasAnticipacion,
                            @Param("idUsuarioModificador") Integer idUsuarioModificador);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_actualizar_configuracion_alerta(:idConfiguracion, :idNivelAlerta, :diasAnticipacion, :idUsuarioModificador)", nativeQuery = true)
    void actualizarConfiguracion(@Param("idConfiguracion") Integer idConfiguracion,
                                 @Param("idNivelAlerta") Integer idNivelAlerta,
                                 @Param("diasAnticipacion") Integer diasAnticipacion,
                                 @Param("idUsuarioModificador") Integer idUsuarioModificador);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_desactivar_configuracion_alerta(:idConfiguracion)", nativeQuery = true)
    void desactivarConfiguracion(@Param("idConfiguracion") Integer idConfiguracion);
}
