package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.ia_alertas.ModeloIA;

import java.util.List;
import java.util.Optional;

public interface IModeloIARepository extends JpaRepository<ModeloIA, Integer> {

    List<ModeloIA> findByActivoTrue();

    Optional<ModeloIA> findByNombreModeloIgnoreCase(String nombreModelo);

    /** El modelo recién creado (mayor id) — el insert se hace vía JdbcTemplate en el servicio */
    ModeloIA findTopByOrderByIdModeloDesc();
}
