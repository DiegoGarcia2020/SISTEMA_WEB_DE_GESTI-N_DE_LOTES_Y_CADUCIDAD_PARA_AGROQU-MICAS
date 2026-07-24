package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.operaciones.OrdenCompra;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad OrdenCompra.
 * Proporciona queries de consulta por filtros y la funcionalidad de "memoria de precios".
 */
public interface IOrdenCompraRepository extends JpaRepository<OrdenCompra, Integer> {

    /** Listar órdenes por estado */
    List<OrdenCompra> findByEstadoOrderByFechaRegistroDesc(String estado);

    /** Listar órdenes por proveedor */
    @Query("SELECT o FROM OrdenCompra o WHERE o.proveedor.idProveedor = :idProveedor ORDER BY o.fechaRegistro DESC")
    List<OrdenCompra> findByProveedor(@Param("idProveedor") Integer idProveedor);

    /** Listar órdenes por rango de fechas de emisión */
    @Query("SELECT o FROM OrdenCompra o WHERE o.fechaEmision BETWEEN :desde AND :hasta ORDER BY o.fechaEmision DESC")
    List<OrdenCompra> findByFechaEmisionBetween(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    /** Filtro combinado: estado + proveedor + rango de fechas (todos opcionales) */
    @Query("SELECT o FROM OrdenCompra o " +
           "WHERE (:estado IS NULL OR o.estado = :estado) " +
           "AND (:idProveedor IS NULL OR o.proveedor.idProveedor = :idProveedor) " +
           "AND (:desde IS NULL OR o.fechaEmision >= :desde) " +
           "AND (:hasta IS NULL OR o.fechaEmision <= :hasta) " +
           "ORDER BY o.fechaRegistro DESC")
    List<OrdenCompra> findByFiltros(@Param("estado") String estado,
                                    @Param("idProveedor") Integer idProveedor,
                                    @Param("desde") LocalDate desde,
                                    @Param("hasta") LocalDate hasta);

    /** Verificar si ya existe una factura con el mismo número para el mismo proveedor */
    Optional<OrdenCompra> findByNumeroFacturaAndProveedorIdProveedor(String numeroFactura, Integer idProveedor);

    /**
     * MEMORIA DE PRECIOS: Obtener el último precio unitario pagado por un producto.
     * Se usa para autocompletar el campo precio cuando el Supervisor selecciona un producto.
     * Solo considera ítems NO bonificación y órdenes no anuladas.
     */
    @Query(value = "SELECT dc.precio_unitario " +
                   "FROM operaciones.detalle_compra dc " +
                   "JOIN operaciones.orden_compra oc ON dc.id_orden_compra = oc.id " +
                   "WHERE dc.id_producto = :idProducto " +
                   "AND dc.es_bonificacion = false " +
                   "AND oc.estado != 'ANULADA' " +
                   "ORDER BY oc.fecha_registro DESC " +
                   "LIMIT 1",
           nativeQuery = true)
    Optional<BigDecimal> findUltimoPrecioProducto(@Param("idProducto") Integer idProducto);
}
