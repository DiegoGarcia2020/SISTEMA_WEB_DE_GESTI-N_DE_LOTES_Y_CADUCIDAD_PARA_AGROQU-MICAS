package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.operaciones.VentaIA;

import java.util.List;
import java.util.Optional;

public interface IVentaIARepository extends JpaRepository<VentaIA, Integer> {

    Optional<VentaIA> findByNumeroOrden(String numeroOrden);

    List<VentaIA> findByTecnico_IdTecnicoOrderByFechaVentaDesc(Integer idTecnico);
}
