package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.DevolucionVenta;

@Repository
public interface DevolucionVentaRepository extends JpaRepository<DevolucionVenta, Integer> {
}
