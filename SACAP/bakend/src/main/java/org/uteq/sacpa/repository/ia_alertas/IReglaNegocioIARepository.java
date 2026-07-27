package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.ia_alertas.ReglaNegocioIA;

import java.util.List;

public interface IReglaNegocioIARepository extends JpaRepository<ReglaNegocioIA, Integer> {

    List<ReglaNegocioIA> findByActivoTrue();

    /** La regla recién creada (mayor id) — el insert se hace vía JdbcTemplate en el servicio */
    ReglaNegocioIA findTopByOrderByIdReglaDesc();
}
