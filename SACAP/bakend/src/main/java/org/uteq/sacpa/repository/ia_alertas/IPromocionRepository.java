package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.ia_alertas.Promocion;

import java.util.List;

public interface IPromocionRepository extends JpaRepository<Promocion, Integer> {

    List<Promocion> findBySugerencia_IdSugerencia(Integer idSugerencia);

    List<Promocion> findByEstado_IdEstadoPromocion(Integer idEstadoPromocion);

    Promocion findTopByOrderByIdPromocionDesc();
}
