package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.DetalleVenta;

import java.util.List;

/** Detalle de la tabla unificada operaciones.detalle_ventas. */
@Repository
public interface IDetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {

    List<DetalleVenta> findByVenta_Id(Integer idVenta);

    /**
     * Trazabilidad de caducidad: a qué ventas fue a parar un lote determinado.
     * Es la consulta que justifica guardar id_lote en el detalle.
     */
    @Query("SELECT d FROM DetalleVenta d WHERE d.lote.idLote = :idLote ORDER BY d.venta.fecha DESC")
    List<DetalleVenta> findByLote(Integer idLote);
}
