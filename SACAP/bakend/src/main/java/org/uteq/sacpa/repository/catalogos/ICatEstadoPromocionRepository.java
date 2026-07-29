package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.CatEstadoPromocion;

import java.util.Optional;

public interface ICatEstadoPromocionRepository extends JpaRepository<CatEstadoPromocion, Integer> {
    Optional<CatEstadoPromocion> findByNombreIgnoreCase(String nombre);
}
