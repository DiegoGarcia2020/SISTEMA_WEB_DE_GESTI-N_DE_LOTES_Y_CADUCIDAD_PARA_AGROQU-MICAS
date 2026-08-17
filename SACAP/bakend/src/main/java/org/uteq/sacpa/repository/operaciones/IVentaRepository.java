package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface IVentaRepository extends JpaRepository<Venta, Integer> {

    interface VentaRankingProjection {
        Integer getIdProducto();
        String getNombre();
        Long getUnidades();
        BigDecimal getMontoTotal();
    }

    @Query(value = """
            SELECT p.id_producto AS idProducto, p.nombre AS nombre,
                   SUM(dv.cantidad) AS unidades, SUM(dv.subtotal) AS montoTotal
            FROM operaciones.detalle_venta dv
            JOIN operaciones.venta v ON v.id_venta = dv.id_venta
            JOIN inventario.producto p ON p.id_producto = dv.id_producto
            WHERE v.fecha_venta >= :desde AND v.fecha_venta < :hasta AND v.id_estado_aprobacion = 2
            GROUP BY p.id_producto, p.nombre
            ORDER BY unidades DESC
            """, nativeQuery = true)
    List<VentaRankingProjection> rankingPorPeriodo(@Param("desde") LocalDateTime desde,
                                                   @Param("hasta") LocalDateTime hasta);

    @Query("SELECT COUNT(DISTINCT v.idVenta) FROM Venta v WHERE v.fechaVenta >= :desde AND v.fechaVenta < :hasta AND v.idEstadoAprobacion = 2")
    Long contarVentasPeriodo(@Param("desde") LocalDateTime desde,
                             @Param("hasta") LocalDateTime hasta);

    @Query(value = "SELECT operaciones.fn_registrar_venta(:idUsuario, :fechaVenta, :cliente, CAST(:detalles AS jsonb))", nativeQuery = true)
    Integer registrarVenta(@Param("idUsuario") Integer idUsuario,
                           @Param("fechaVenta") LocalDateTime fechaVenta,
                           @Param("cliente") String cliente,
                           @Param("detalles") String detalles);
}
