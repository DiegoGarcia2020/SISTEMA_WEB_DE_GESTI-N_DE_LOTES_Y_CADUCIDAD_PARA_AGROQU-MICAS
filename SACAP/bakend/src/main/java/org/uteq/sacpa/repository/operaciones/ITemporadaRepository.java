package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.Temporada;

import java.util.List;
import java.util.Optional;

@Repository
public interface ITemporadaRepository extends JpaRepository<Temporada, Integer> {
    
    List<Temporada> findByEstado(String estado);
    Optional<Temporada> findByEstadoAndCultivo_IdCultivo(String estado, Integer idCultivo);
    Optional<Temporada> findByEstadoAndCultivoIsNull(String estado);
}
