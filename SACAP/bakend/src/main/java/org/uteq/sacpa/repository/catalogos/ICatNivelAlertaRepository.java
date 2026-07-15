package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.catalogos.CatNivelAlerta;

public interface ICatNivelAlertaRepository extends JpaRepository<CatNivelAlerta, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_crear_nivel_alerta(:nombre)", nativeQuery = true)
    void crearNivelAlerta(@Param("nombre") String nombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_actualizar_nivel_alerta(:idNivelAlerta, :nuevoNombre)", nativeQuery = true)
    void actualizarNivelAlerta(@Param("idNivelAlerta") Integer idNivelAlerta, @Param("nuevoNombre") String nuevoNombre);

    @Modifying @Transactional
    @Query(value = "SELECT catalogos.fn_desactivar_nivel_alerta(:idNivelAlerta)", nativeQuery = true)
    void desactivarNivelAlerta(@Param("idNivelAlerta") Integer idNivelAlerta);
}
