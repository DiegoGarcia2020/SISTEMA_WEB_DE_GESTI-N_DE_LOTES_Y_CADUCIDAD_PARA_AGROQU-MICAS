package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.CatEstadoVenta;

import java.util.Optional;

public interface ICatEstadoVentaRepository extends JpaRepository<CatEstadoVenta, Integer> {
    Optional<CatEstadoVenta> findByNombreIgnoreCase(String nombre);
}
