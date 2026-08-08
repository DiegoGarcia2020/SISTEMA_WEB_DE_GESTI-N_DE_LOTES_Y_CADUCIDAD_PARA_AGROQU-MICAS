package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.operaciones.DetalleVentaIA;

import java.util.List;

public interface IDetalleVentaIARepository extends JpaRepository<DetalleVentaIA, Integer> {

    List<DetalleVentaIA> findByVenta_IdVenta(Integer idVenta);
}
