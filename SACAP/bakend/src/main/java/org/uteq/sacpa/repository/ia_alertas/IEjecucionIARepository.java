package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.EjecucionIA;

import java.util.List;

public interface IEjecucionIARepository extends JpaRepository<EjecucionIA, Integer> {

    List<EjecucionIA> findByModelo_IdModeloOrderByFechaEjecucionDesc(Integer idModelo);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_ejecucion_ia(:parametrosEnviados, :idModelo)", nativeQuery = true)
    void crearEjecucion(@Param("parametrosEnviados") String parametrosEnviados,
                        @Param("idModelo") Integer idModelo);
}
