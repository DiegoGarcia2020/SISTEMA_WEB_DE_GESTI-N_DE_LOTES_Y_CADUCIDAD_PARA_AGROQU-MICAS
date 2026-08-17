package org.uteq.sacpa.repository.analisis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.inventario.Producto;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IAnalisisRepository extends JpaRepository<Producto, Integer> {

    // =====================================================
    // P2: Productos con mayor ingreso bruto
    // =====================================================
    @Query(value = """
        SELECT p.id_producto AS idProducto, p.nombre AS nombre,
               SUM(dv.cantidad) AS unidadesVendidas,
               COALESCE(SUM(dv.subtotal), 0) AS ingresoTotal
        FROM operaciones.detalle_venta dv
        JOIN operaciones.venta v ON v.id_venta = dv.id_venta
        JOIN inventario.producto p ON p.id_producto = dv.id_producto
        WHERE v.fecha_venta >= :desde AND v.fecha_venta < :hasta
          AND v.id_estado_aprobacion = 2
        GROUP BY p.id_producto, p.nombre
        ORDER BY ingresoTotal DESC
        """, nativeQuery = true)
    List<Object[]> mayorIngreso(@Param("desde") LocalDateTime desde,
                                 @Param("hasta") LocalDateTime hasta);

    @Query(value = """
        SELECT p.id_producto AS idProducto, p.nombre AS nombre,
               SUM(dv.cantidad) AS unidadesVendidas,
               COALESCE(SUM(dv.subtotal), 0) AS ingresoTotal
        FROM operaciones.detalle_venta dv
        JOIN operaciones.venta v ON v.id_venta = dv.id_venta
        JOIN inventario.producto p ON p.id_producto = dv.id_producto
        WHERE v.fecha_venta >= :desde AND v.fecha_venta < :hasta
          AND v.id_estado_aprobacion = 2
        GROUP BY p.id_producto, p.nombre
        ORDER BY ingresoTotal DESC
        """, nativeQuery = true)
    List<Object[]> mayorIngresoPeriodoAnterior(@Param("desde") LocalDateTime desde,
                                                @Param("hasta") LocalDateTime hasta);

    // =====================================================
    // P3: Demanda por temporada agrícola
    // =====================================================
    @Query(value = """
        SELECT p.id_producto AS idProducto, p.nombre AS nombre,
               SUM(dv.cantidad) AS unidadesVendidas,
               COALESCE(SUM(dv.subtotal), 0) AS montoTotal
        FROM operaciones.detalle_venta dv
        JOIN operaciones.venta v ON v.id_venta = dv.id_venta
        JOIN inventario.producto p ON p.id_producto = dv.id_producto
        WHERE v.fecha_venta >= :fechaInicio AND v.fecha_venta < :fechaFin
          AND v.id_estado_aprobacion = 2
        GROUP BY p.id_producto, p.nombre
        ORDER BY unidadesVendidas DESC
        """, nativeQuery = true)
    List<Object[]> demandaPorTemporada(@Param("fechaInicio") LocalDateTime fechaInicio,
                                        @Param("fechaFin") LocalDateTime fechaFin);

    // =====================================================
    // P5: Lotes próximos a vencer en N días
    // =====================================================
    @Query(value = """
        SELECT l.id_lote AS idLote, l.numero_lote AS numeroLote,
               p.nombre AS nombreProducto,
               l.cantidad_actual AS cantidadActual,
               l.fecha_vencimiento AS fechaVencimiento,
               (l.fecha_vencimiento - CURRENT_DATE) AS diasRestantes,
               COALESCE(na.nombre, 'SIN ALERTA') AS nivelAlerta,
               COALESCE(el.nombre, 'ACTIVO') AS estadoLote
        FROM inventario.lotes l
        JOIN inventario.producto p ON p.id_producto = l.id_producto
        LEFT JOIN ia_alertas.alertas_caducidad ac ON ac.id_lote = l.id_lote AND ac.id_estado = 1
        LEFT JOIN catalogos.cat_nivel_alerta na ON na.id_nivel_alerta = ac.id_nivel_alerta
        LEFT JOIN catalogos.cat_estado_lote el ON el.id_estado_lote = l.id_estado_lote
        WHERE l.fecha_vencimiento <= CURRENT_DATE + (:dias || ' days')::INTERVAL
          AND l.fecha_vencimiento >= CURRENT_DATE
          AND l.activo = TRUE
          AND l.cantidad_actual > 0
        ORDER BY l.fecha_vencimiento ASC
        """, nativeQuery = true)
    List<Object[]> lotesProximosAVencer(@Param("dias") Integer dias);

    // =====================================================
    // P6: Productos estancados (sin movimiento reciente)
    // =====================================================
    @Query(value = """
        WITH ultimo_movimiento AS (
            SELECT l.id_producto,
                   MAX(mi.fecha_movimiento) AS ultimo_movimiento
            FROM inventario.lotes l
            LEFT JOIN operaciones.movimientos_inventario mi ON mi.id_lote = l.id_lote
            WHERE l.activo = TRUE
            GROUP BY l.id_producto
        )
        SELECT p.id_producto AS idProducto, p.nombre AS nombre,
               COALESCE(SUM(l.cantidad_actual), 0)::INTEGER AS cantidadActual,
               um.ultimo_movimiento AS ultimoMovimiento,
               EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - COALESCE(um.ultimo_movimiento, l.fecha_ingreso))) / 86400 AS diasSinMovimiento
        FROM inventario.producto p
        JOIN inventario.lotes l ON l.id_producto = p.id_producto
        LEFT JOIN ultimo_movimiento um ON um.id_producto = p.id_producto
        WHERE l.activo = TRUE AND l.cantidad_actual > 0
        GROUP BY p.id_producto, p.nombre, um.ultimo_movimiento, l.fecha_ingreso
        ORDER BY diasSinMovimiento DESC NULLS LAST
        """, nativeQuery = true)
    List<Object[]> productosEstancados();

    // =====================================================
    // P7: Total inventario almacenado
    // =====================================================
    @Query(value = """
        SELECT p.id_producto AS idProducto, p.nombre AS nombre,
               p.unidad_medida AS unidadMedida,
               SUM(l.cantidad_actual) AS cantidadTotal,
               p.precio AS precioUnitario,
               SUM(l.cantidad_actual) * p.precio AS valorTotal,
               COUNT(DISTINCT l.id_lote)::INTEGER AS lotesActivos
        FROM inventario.lotes l
        JOIN inventario.producto p ON p.id_producto = l.id_producto
        WHERE l.activo = TRUE AND l.cantidad_actual > 0
        GROUP BY p.id_producto, p.nombre, p.unidad_medida, p.precio
        ORDER BY valorTotal DESC
        """, nativeQuery = true)
    List<Object[]> inventarioTotal();

    // =====================================================
    // P8: Movimientos de producto por rango de fechas
    // =====================================================
    @Query(value = """
        SELECT mi.id_movimiento AS idMovimiento,
               p.nombre AS nombreProducto,
               l.numero_lote AS numeroLote,
               tm.nombre AS tipoMovimiento,
               tm.naturaleza AS naturaleza,
               mi.cantidad AS cantidad,
               mi.fecha_movimiento AS fechaMovimiento,
               COALESCE(u.correo, 'SISTEMA') AS usuario,
               COALESCE(mi.observacion, '') AS observacion
        FROM operaciones.movimientos_inventario mi
        JOIN inventario.lotes l ON l.id_lote = mi.id_lote
        JOIN inventario.producto p ON p.id_producto = l.id_producto
        JOIN catalogos.cat_tipo_movimiento tm ON tm.id_tipo_movimiento = mi.id_tipo_movimiento
        LEFT JOIN seguridad.usuario u ON u.id_usuario = mi.id_usuario
        WHERE mi.fecha_movimiento >= :desde AND mi.fecha_movimiento < :hasta
        ORDER BY mi.fecha_movimiento DESC
        """, nativeQuery = true)
    List<Object[]> movimientosPorRango(@Param("desde") LocalDateTime desde,
                                        @Param("hasta") LocalDateTime hasta);

    // =====================================================
    // P10: % de sugerencias/promociones aprobadas
    // =====================================================
    @Query(value = """
        SELECT
            (SELECT COUNT(*)::INTEGER FROM ia_alertas.sugerencias_ia WHERE id_estado_aprobacion = 2) AS aprobadas,
            (SELECT COUNT(*)::INTEGER FROM ia_alertas.sugerencias_ia) AS totalSugeridas,
            (SELECT COUNT(*)::INTEGER FROM ia_alertas.promociones WHERE id_estado = 1) AS activas
        """, nativeQuery = true)
    List<Object[]> estadisticasPromociones();

    // =====================================================
    // P12: Productos salvados de caducidad
    // =====================================================
    @Query(value = """
        SELECT l.id_lote AS idLote, l.numero_lote AS numeroLote,
               p.nombre AS nombreProducto,
               l.cantidad_inicial AS cantidadAlertada,
               COALESCE(SUM(dv.cantidad), 0)::INTEGER AS cantidadVendida,
               l.fecha_vencimiento AS fechaVencimiento,
               COALESCE(ac.mensaje, 'Sin alerta registrada') AS nombreAlerta
        FROM ia_alertas.alertas_caducidad ac
        JOIN inventario.lotes l ON l.id_lote = ac.id_lote
        JOIN inventario.producto p ON p.id_producto = l.id_producto
        LEFT JOIN operaciones.detalle_venta dv ON dv.id_lote = l.id_lote
        WHERE ac.id_estado = 1
          AND l.fecha_vencimiento > CURRENT_DATE
          AND l.cantidad_actual < l.cantidad_inicial
        GROUP BY l.id_lote, l.numero_lote, p.nombre, l.cantidad_inicial,
                 l.fecha_vencimiento, ac.mensaje
        HAVING COALESCE(SUM(dv.cantidad), 0) > 0
        ORDER BY COALESCE(SUM(dv.cantidad), 0) DESC
        """, nativeQuery = true)
    List<Object[]> productosSalvados();

    // =====================================================
    // P16: Usuarios con anulaciones/ajustes
    // =====================================================
    @Query(value = """
        SELECT a.id_usuario AS idUsuario,
               u.correo AS correo,
               a.operacion AS operacion,
               a.tabla_afectada AS tablaAfectada,
               COUNT(*)::INTEGER AS totalOperaciones,
               MAX(a.fecha_hora) AS ultimaOperacion
        FROM seguridad.auditoria a
        JOIN seguridad.usuario u ON u.id_usuario = a.id_usuario
        WHERE a.fecha_hora >= :desde
          AND (UPPER(a.operacion) LIKE '%ANULAR%'
               OR UPPER(a.operacion) LIKE '%ELIMINAR%'
               OR UPPER(a.operacion) LIKE '%AJUSTE%'
               OR UPPER(a.tabla_afectada) LIKE '%movimiento%'
               OR UPPER(a.tabla_afectada) LIKE '%venta%')
        GROUP BY a.id_usuario, u.correo, a.operacion, a.tabla_afectada
        ORDER BY totalOperaciones DESC
        """, nativeQuery = true)
    List<Object[]> usuariosConAnulaciones(@Param("desde") LocalDateTime desde);

    // =====================================================
    // P17: Días de mayor compra
    // =====================================================
    @Query(value = """
        SELECT EXTRACT(DOW FROM v.fecha_venta)::INTEGER AS diaSemana,
               CASE EXTRACT(DOW FROM v.fecha_venta)
                   WHEN 0 THEN 'Domingo'
                   WHEN 1 THEN 'Lunes'
                   WHEN 2 THEN 'Martes'
                   WHEN 3 THEN 'Miércoles'
                   WHEN 4 THEN 'Jueves'
                   WHEN 5 THEN 'Viernes'
                   WHEN 6 THEN 'Sábado'
               END AS nombreDia,
               COUNT(DISTINCT v.id_venta) AS totalVentas,
               COALESCE(SUM(v.total), 0) AS montoTotal,
               COALESCE(SUM(dv.cantidad), 0) AS totalUnidades
        FROM operaciones.venta v
        LEFT JOIN operaciones.detalle_venta dv ON dv.id_venta = v.id_venta
        WHERE v.id_estado_aprobacion = 2
          AND v.fecha_venta >= :desde AND v.fecha_venta < :hasta
        GROUP BY EXTRACT(DOW FROM v.fecha_venta)
        ORDER BY diaSemana
        """, nativeQuery = true)
    List<Object[]> ventasPorDiaSemana(@Param("desde") LocalDateTime desde,
                                       @Param("hasta") LocalDateTime hasta);

    // =====================================================
    // P18: Clientes que más compran
    // =====================================================
    @Query(value = """
        SELECT v.cliente AS cliente,
               COUNT(DISTINCT v.id_venta) AS totalCompras,
               COALESCE(SUM(v.total), 0) AS montoTotal,
               COALESCE(AVG(v.total), 0) AS promedioCompra,
               MAX(v.fecha_venta) AS ultimaCompra
        FROM operaciones.venta v
        WHERE v.id_estado_aprobacion = 2
          AND v.cliente IS NOT NULL AND TRIM(v.cliente) != ''
        GROUP BY v.cliente
        ORDER BY totalCompras DESC
        """, nativeQuery = true)
    List<Object[]> clientesFrecuentes();

    // =====================================================
    // P20: Devoluciones mensuales
    // =====================================================
    @Query(value = """
        WITH motivos AS (
            SELECT EXTRACT(YEAR FROM d.fecha_devolucion)::INTEGER AS anio,
                   EXTRACT(MONTH FROM d.fecha_devolucion)::INTEGER AS mes,
                   d.motivo,
                   COUNT(*) AS cnt,
                   ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM d.fecha_devolucion), EXTRACT(MONTH FROM d.fecha_devolucion) ORDER BY COUNT(*) DESC) AS rn
            FROM operaciones.devoluciones d
            WHERE d.fecha_devolucion >= :desde
            GROUP BY EXTRACT(YEAR FROM d.fecha_devolucion), EXTRACT(MONTH FROM d.fecha_devolucion), d.motivo
        )
        SELECT d3.anio,
               d3.mes,
               CASE d3.mes
                   WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero'
                   WHEN 3 THEN 'Marzo' WHEN 4 THEN 'Abril'
                   WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio'
                   WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto'
                   WHEN 9 THEN 'Septiembre' WHEN 10 THEN 'Octubre'
                   WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre'
               END AS nombreMes,
               d3.totalDevoluciones,
               d3.cantidadTotal,
               COALESCE(m.motivo, 'Sin motivo') AS motivoPrincipal
        FROM (
            SELECT EXTRACT(YEAR FROM d2.fecha_devolucion)::INTEGER AS anio,
                   EXTRACT(MONTH FROM d2.fecha_devolucion)::INTEGER AS mes,
                   COUNT(*)::INTEGER AS totalDevoluciones,
                   SUM(d2.cantidad)::INTEGER AS cantidadTotal
            FROM operaciones.devoluciones d2
            WHERE d2.fecha_devolucion >= :desde
            GROUP BY EXTRACT(YEAR FROM d2.fecha_devolucion), EXTRACT(MONTH FROM d2.fecha_devolucion)
        ) d3
        LEFT JOIN motivos m ON m.anio = d3.anio AND m.mes = d3.mes AND m.rn = 1
        ORDER BY d3.anio DESC, d3.mes DESC
        """, nativeQuery = true)
    List<Object[]> devolucionesMensuales(@Param("desde") LocalDateTime desde);

    // =====================================================
    // P21: Productos que salen rápido por temporada
    // =====================================================
    @Query(value = """
        SELECT p.id_producto AS idProducto, p.nombre AS nombre,
               t.nombre_temporada AS temporada,
               SUM(dv.cantidad) AS unidadesVendidas,
               COALESCE(SUM(dv.subtotal), 0) AS montoTotal
        FROM operaciones.detalle_venta dv
        JOIN operaciones.venta v ON v.id_venta = dv.id_venta
        JOIN inventario.producto p ON p.id_producto = dv.id_producto
        JOIN ia_alertas.temporadas_agricolas t
          ON v.fecha_venta >= t.fecha_inicio::timestamp
         AND v.fecha_venta < (t.fecha_fin + INTERVAL '1 day')::timestamp
        WHERE v.id_estado_aprobacion = 2
        GROUP BY p.id_producto, p.nombre, t.nombre_temporada, t.fecha_inicio
        ORDER BY t.fecha_inicio DESC, unidadesVendidas DESC
        """, nativeQuery = true)
    List<Object[]> productosPorTemporada();

    // =====================================================
    // P22: Churn de clientes (dejaron de comprar)
    // =====================================================
    @Query(value = """
        WITH historial AS (
            SELECT v.cliente,
                   COUNT(*) AS totalCompras,
                   SUM(v.total) AS montoTotal,
                   MAX(v.fecha_venta) AS ultimaCompra,
                   AVG(v.total) AS promedioMensual
            FROM operaciones.venta v
            WHERE v.id_estado_aprobacion = 2
              AND v.cliente IS NOT NULL AND TRIM(v.cliente) != ''
            GROUP BY v.cliente
        )
        SELECT cliente, totalCompras, montoTotal, ultimaCompra,
               EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ultimaCompra)) / 2592000 AS mesesSinCompra,
               promedioMensual
        FROM historial
        WHERE ultimaCompra < CURRENT_DATE - INTERVAL '2 months'
        ORDER BY mesesSinCompra DESC
        """, nativeQuery = true)
    List<Object[]> clientesChurn();
}
