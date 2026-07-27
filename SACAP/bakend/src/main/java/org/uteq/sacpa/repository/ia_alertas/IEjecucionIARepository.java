package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.ia_alertas.EjecucionIA;

import java.util.List;

public interface IEjecucionIARepository extends JpaRepository<EjecucionIA, Integer> {

    List<EjecucionIA> findByModelo_IdModeloOrderByFechaEjecucionDesc(Integer idModelo);

    /** La ejecución recién creada (mayor id) — el insert se hace vía JdbcTemplate en el servicio */
    EjecucionIA findTopByOrderByIdEjecucionDesc();
}
