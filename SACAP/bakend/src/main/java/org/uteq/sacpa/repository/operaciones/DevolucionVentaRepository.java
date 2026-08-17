package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.DevolucionVenta;

import java.util.List;

@Repository
public interface DevolucionVentaRepository extends JpaRepository<DevolucionVenta, Integer> {
    List<DevolucionVenta> findByVenta_Id(Integer idVenta);
    Page<DevolucionVenta> findByEstadoLogistico(String estadoLogistico, Pageable pageable);
    
    @Query("SELECT d FROM DevolucionVenta d WHERE d.venta.tecnico.idUsuario = :idTecnico ORDER BY d.fechaSolicitud DESC")
    List<DevolucionVenta> findByTecnico(@Param("idTecnico") Integer idTecnico);
}
