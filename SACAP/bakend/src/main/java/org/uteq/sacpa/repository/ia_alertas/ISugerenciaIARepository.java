package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;

import java.util.List;

public interface ISugerenciaIARepository extends JpaRepository<SugerenciaIA, Integer> {

    List<SugerenciaIA> findByLote_IdLote(Integer idLote);

    /** La sugerencia recién creada (mayor id) — el insert se hace vía JdbcTemplate en el servicio */
    SugerenciaIA findTopByOrderByIdSugerenciaDesc();
}
