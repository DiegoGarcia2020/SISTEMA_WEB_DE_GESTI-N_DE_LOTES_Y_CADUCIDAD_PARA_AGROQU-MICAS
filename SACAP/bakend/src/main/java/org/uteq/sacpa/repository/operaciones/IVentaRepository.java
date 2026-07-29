package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.util.List;
import java.util.Optional;

public interface IVentaRepository extends JpaRepository<Venta, Integer> {

    Optional<Venta> findByNumeroOrden(String numeroOrden);

    List<Venta> findByTecnico_IdTecnicoOrderByFechaVentaDesc(Integer idTecnico);
}
