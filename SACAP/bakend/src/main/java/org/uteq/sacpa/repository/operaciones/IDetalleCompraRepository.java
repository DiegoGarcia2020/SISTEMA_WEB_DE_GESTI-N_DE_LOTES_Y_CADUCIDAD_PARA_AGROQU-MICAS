package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.operaciones.DetalleCompra;

import java.util.List;

/**
 * Repositorio para la entidad DetalleCompra.
 */
public interface IDetalleCompraRepository extends JpaRepository<DetalleCompra, Integer> {

    /** Obtener todos los detalles de una orden específica */
    @Query("SELECT d FROM DetalleCompra d JOIN FETCH d.producto WHERE d.ordenCompra.id = :idOrdenCompra")
    List<DetalleCompra> findByOrdenCompraId(@Param("idOrdenCompra") Integer idOrdenCompra);
}
