package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.Temporada;

import java.util.Optional;

@Repository
public interface ITemporadaRepository extends JpaRepository<Temporada, Integer> {
    
    Optional<Temporada> findByEstado(String estado);
}
