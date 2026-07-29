package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.CatEstadoTemporada;

import java.util.Optional;

public interface ICatEstadoTemporadaRepository extends JpaRepository<CatEstadoTemporada, Integer> {
    Optional<CatEstadoTemporada> findByNombreIgnoreCase(String nombre);
}
