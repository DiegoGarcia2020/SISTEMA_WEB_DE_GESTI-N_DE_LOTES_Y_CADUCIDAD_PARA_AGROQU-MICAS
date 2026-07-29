package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.CatEstadoAlerta;

import java.util.Optional;

public interface ICatEstadoAlertaRepository extends JpaRepository<CatEstadoAlerta, Integer> {
    Optional<CatEstadoAlerta> findByNombreIgnoreCase(String nombre);
}
