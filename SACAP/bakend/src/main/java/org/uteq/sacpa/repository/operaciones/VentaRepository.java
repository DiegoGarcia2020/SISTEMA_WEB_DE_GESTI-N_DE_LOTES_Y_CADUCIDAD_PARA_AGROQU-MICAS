package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    java.util.List<Venta> findByTecnico_IdUsuario(Integer idUsuario);
}
