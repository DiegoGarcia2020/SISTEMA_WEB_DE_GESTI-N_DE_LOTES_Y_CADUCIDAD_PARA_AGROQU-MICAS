package org.uteq.sacpa.service.reportes;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.reportes.ReporteFiltrosDTO;
import org.uteq.sacpa.dto.reportes.ReporteRespuestaDTO;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements IReporteService {

    private final JdbcTemplate jdbcTemplate;
    private final IUsuarioRepository usuarioRepository;

    private Integer getUserId(String username) {
        if (username == null) return null;
        return usuarioRepository.findByCorreo(username)
                .map(u -> u.getIdUsuario())
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosMasVendidos(ReporteFiltrosDTO filtros, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre AS producto, SUM(dv.cantidad) AS cantidad_vendida, SUM(dv.subtotal) AS total_generado " +
            "FROM operaciones.ventas v " +
            "JOIN operaciones.detalle_ventas dv ON v.id = dv.id_venta " +
            "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if ("TÉCNICO DE CAMPO".equalsIgnoreCase(rol)) {
            sql.append(" AND v.id_tecnico = ? ");
            params.add(getUserId(username));
        }

        if (filtros != null && filtros.getFechaInicio() != null && filtros.getFechaFin() != null) {
            sql.append(" AND v.fecha BETWEEN ? AND ? ");
            params.add(filtros.getFechaInicio());
            params.add(filtros.getFechaFin());
        }

        sql.append(" GROUP BY p.nombre ORDER BY cantidad_vendida DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Productos Más Vendidos", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosMayorGanancia(ReporteFiltrosDTO filtros) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre AS producto, " +
            "SUM((dv.precio_unitario - COALESCE(l.costo_unitario_real, 0)) * dv.cantidad) AS ganancia_total " +
            "FROM operaciones.detalle_ventas dv " +
            "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "JOIN operaciones.ventas v ON v.id = dv.id_venta " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (filtros != null && filtros.getFechaInicio() != null && filtros.getFechaFin() != null) {
            sql.append(" AND v.fecha BETWEEN ? AND ? ");
            params.add(filtros.getFechaInicio());
            params.add(filtros.getFechaFin());
        }

        sql.append(" GROUP BY p.nombre ORDER BY ganancia_total DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Productos con Mayor Ganancia", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductoMayorDemandaTemporada(ReporteFiltrosDTO filtros) {
        // En esta base simplificada, podemos cruzar las ventas que ocurren dentro del rango de una temporada
        String sql = "SELECT p.nombre AS producto, t.nombre AS temporada, SUM(dv.cantidad) AS cantidad_vendida " +
                     "FROM operaciones.ventas v " +
                     "JOIN operaciones.detalle_ventas dv ON v.id = dv.id_venta " +
                     "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
                     "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
                     "JOIN operaciones.temporada t ON v.fecha >= t.fecha_inicio " +
                     "  AND (t.fecha_fin IS NULL OR v.fecha <= t.fecha_fin) " +
                     "GROUP BY p.nombre, t.nombre " +
                     "ORDER BY cantidad_vendida DESC";

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Mayor Demanda por Temporada", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getDiaMasCompras(ReporteFiltrosDTO filtros) {
        String sql = "SELECT to_char(fecha, 'Day') AS dia_semana, COUNT(id) AS total_ventas " +
                     "FROM operaciones.ventas " +
                     "GROUP BY to_char(fecha, 'Day') " +
                     "ORDER BY total_ventas DESC";

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Día con Más Compras", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getRotacionTemporada(ReporteFiltrosDTO filtros, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre AS producto, AVG(v.fecha::date - l.fecha_ingreso::date) AS dias_rotacion_promedio " +
            "FROM operaciones.detalle_ventas dv " +
            "JOIN operaciones.ventas v ON dv.id_venta = v.id " +
            "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "WHERE l.fecha_ingreso IS NOT NULL "
        );
        List<Object> params = new ArrayList<>();

        if ("TÉCNICO DE CAMPO".equalsIgnoreCase(rol)) {
            sql.append(" AND v.id_tecnico = ? ");
            params.add(getUserId(username));
        }

        sql.append(" GROUP BY p.nombre ORDER BY dias_rotacion_promedio ASC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Rotación Rápida", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getCombosMayorExito(ReporteFiltrosDTO filtros) {
        String sql = "SELECT pr.nombre_promocion AS combo, COUNT(dv.id_detalle) AS veces_vendido " +
                     "FROM operaciones.detalle_ventas dv " +
                     "JOIN ia_alertas.promociones pr ON dv.id_promocion = pr.id_promocion " +
                     "GROUP BY pr.nombre_promocion " +
                     "ORDER BY veces_vendido DESC";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Combos de Mayor Éxito", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getEfectividadCombos(ReporteFiltrosDTO filtros, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT e.nombres || ' ' || e.apellidos AS supervisor, " +
            "COUNT(pr.id_promocion) AS combos_aprobados, " +
            "SUM(CASE WHEN dv.id_promocion IS NOT NULL THEN 1 ELSE 0 END) AS ventas_generadas " +
            "FROM ia_alertas.promociones pr " +
            "JOIN gerencia.empleado e ON pr.id_usuario_aprueba = e.id_usuario " +
            "LEFT JOIN operaciones.detalle_ventas dv ON pr.id_promocion = dv.id_promocion " +
            "WHERE pr.id_estado = 1 " // ACTIVO
        );
        List<Object> params = new ArrayList<>();

        if ("SUPERVISOR".equalsIgnoreCase(rol)) {
            sql.append(" AND pr.id_usuario_aprueba = ? ");
            params.add(getUserId(username));
        }

        sql.append(" GROUP BY e.nombres, e.apellidos ORDER BY ventas_generadas DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Efectividad de Combos Aprobados", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosPorCaducar(ReporteFiltrosDTO filtros) {
        String sql = "SELECT p.nombre AS producto, l.numero_lote AS lote, l.fecha_vencimiento AS caducidad, " +
                     "(l.fecha_vencimiento - CURRENT_DATE) AS dias_restantes " +
                     "FROM inventario.lotes l " +
                     "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
                     "WHERE l.fecha_vencimiento >= CURRENT_DATE AND (l.fecha_vencimiento - CURRENT_DATE) <= 30 " +
                     "ORDER BY dias_restantes ASC";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Productos Próximos a Caducar", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getArticulosEstancados(ReporteFiltrosDTO filtros) {
        // Lotes que no han tenido ventas en los últimos 60 días
        String sql = "SELECT p.nombre AS producto, l.numero_lote AS lote, MAX(v.fecha) AS ultima_venta " +
                     "FROM inventario.lotes l " +
                     "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
                     "LEFT JOIN operaciones.detalle_ventas dv ON l.id_lote = dv.id_lote " +
                     "LEFT JOIN operaciones.ventas v ON dv.id_venta = v.id " +
                     "GROUP BY p.nombre, l.numero_lote " +
                     "HAVING MAX(v.fecha) < CURRENT_DATE - INTERVAL '60 days' OR MAX(v.fecha) IS NULL " +
                     "ORDER BY ultima_venta ASC NULLS FIRST";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Artículos Estancados", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getTotalInventarioAlmacenado(ReporteFiltrosDTO filtros, String rol) {
        boolean mostrarMontos = !"BODEGUERO".equalsIgnoreCase(rol);
        
        String select = mostrarMontos 
            ? "SELECT p.nombre AS producto, SUM(l.cantidad_actual) AS total_unidades, SUM(l.cantidad_actual * COALESCE(l.costo_unitario_real, 0)) AS valor_total " 
            : "SELECT p.nombre AS producto, SUM(l.cantidad_actual) AS total_unidades ";
            
        String sql = select +
                     "FROM inventario.lotes l " +
                     "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
                     "WHERE l.cantidad_actual > 0 " +
                     "GROUP BY p.nombre " +
                     "ORDER BY total_unidades DESC";

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Total de Inventario", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getMovimientosPorProducto(ReporteFiltrosDTO filtros) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre AS producto, m.tipo_movimiento AS tipo, m.cantidad AS cantidad, m.fecha_movimiento AS fecha " +
            "FROM operaciones.movimientos_inventario m " +
            "JOIN inventario.lotes l ON m.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (filtros != null && filtros.getFechaInicio() != null && filtros.getFechaFin() != null) {
            sql.append(" AND m.fecha_movimiento BETWEEN ? AND ? ");
            params.add(filtros.getFechaInicio());
            params.add(filtros.getFechaFin());
        }

        sql.append(" ORDER BY m.fecha_movimiento DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Movimientos de Inventario", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getAlertasCriticas(ReporteFiltrosDTO filtros) {
        String sql = "SELECT l.numero_lote AS lote, na.nombre AS riesgo, ac.fecha_generacion AS fecha " +
                     "FROM ia_alertas.alertas_caducidad ac " +
                     "JOIN inventario.lotes l ON ac.id_lote = l.id_lote " +
                     "JOIN catalogos.cat_nivel_alerta na ON ac.id_nivel_alerta = na.id_nivel_alerta " +
                     "WHERE ac.id_estado = 1 " + // ACTIVA
                     "ORDER BY ac.fecha_generacion DESC";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Alertas Críticas Activas", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosSalvadosCaducidad(ReporteFiltrosDTO filtros, String username, String rol) {
        // Simplificación: lotes con alerta que terminaron con ventas asociadas a promociones
        String sql = "SELECT p.nombre AS producto, l.numero_lote AS lote, SUM(dv.cantidad) AS cantidad_salvada " +
                     "FROM ia_alertas.alertas_caducidad ac " +
                     "JOIN inventario.lotes l ON ac.id_lote = l.id_lote " +
                     "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
                     "JOIN operaciones.detalle_ventas dv ON dv.id_lote = l.id_lote " +
                     "WHERE dv.id_promocion IS NOT NULL " +
                     "GROUP BY p.nombre, l.numero_lote";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Productos Salvados", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getOrdenesPendientesDespacho(ReporteFiltrosDTO filtros, String username, String rol) {
        String sql = "SELECT o.numero_factura AS orden, p.nombre_razon_social AS proveedor, o.fecha_llegada_estimada AS esperada " +
                     "FROM operaciones.orden_compra o " +
                     "JOIN entidades.proveedor p ON o.id_proveedor = p.id_proveedor " +
                     "WHERE o.estado = 'PENDIENTE'";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Órdenes Pendientes", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getOrdenesDespachadasHoy(ReporteFiltrosDTO filtros, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT e.nombres || ' ' || e.apellidos AS bodeguero, COUNT(DISTINCT m.id_movimiento) AS despachos " +
            "FROM operaciones.movimientos_inventario m " +
            "JOIN catalogos.cat_tipo_movimiento tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento " +
            "JOIN gerencia.empleado e ON m.id_usuario = e.id_usuario " +
            "WHERE tm.naturaleza = 'SALIDA' AND m.fecha_movimiento::date = CURRENT_DATE "
        );
        List<Object> params = new ArrayList<>();

        if ("BODEGUERO".equalsIgnoreCase(rol)) {
            sql.append(" AND m.id_usuario = ? ");
            params.add(getUserId(username));
        }

        sql.append(" GROUP BY bodeguero");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Órdenes Despachadas Hoy", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getClientesMasCompran(ReporteFiltrosDTO filtros, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT c.nombre_finca AS cliente, SUM(v.total) AS total_comprado " +
            "FROM operaciones.ventas v " +
            "JOIN entidades.clientes c ON v.id_cliente = c.id_cliente " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if ("TÉCNICO DE CAMPO".equalsIgnoreCase(rol)) {
            sql.append(" AND c.id_tecnico_asignado = ? ");
            params.add(getUserId(username));
        }

        if (filtros != null && filtros.getFechaInicio() != null && filtros.getFechaFin() != null) {
            sql.append(" AND v.fecha BETWEEN ? AND ? ");
            params.add(filtros.getFechaInicio());
            params.add(filtros.getFechaFin());
        }

        sql.append(" GROUP BY c.nombre_finca ORDER BY total_comprado DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Top Clientes", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getMercaderiaDevueltaPorMes(ReporteFiltrosDTO filtros, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT to_char(d.fecha_solicitud, 'YYYY-MM') AS mes, d.motivo AS motivo, COUNT(*) AS cantidad " +
            "FROM operaciones.devoluciones_venta d " +
            "JOIN operaciones.ventas v ON d.id_venta = v.id " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if ("TÉCNICO DE CAMPO".equalsIgnoreCase(rol)) {
            sql.append(" AND v.id_tecnico = ? ");
            params.add(getUserId(username));
        }

        sql.append(" GROUP BY mes, d.motivo ORDER BY mes DESC, cantidad DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Devoluciones Mensuales", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getClientesChurn(ReporteFiltrosDTO filtros, String username, String rol) {
        // Clientes que compraron antes, pero no en los últimos 3 meses
        StringBuilder sql = new StringBuilder(
            "SELECT c.nombre_finca AS cliente, MAX(v.fecha) AS ultima_compra " +
            "FROM entidades.clientes c " +
            "JOIN operaciones.ventas v ON c.id_cliente = v.id_cliente " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if ("TÉCNICO DE CAMPO".equalsIgnoreCase(rol)) {
            sql.append(" AND c.id_tecnico_asignado = ? ");
            params.add(getUserId(username));
        }

        sql.append(" GROUP BY c.nombre_finca HAVING MAX(v.fecha) < CURRENT_DATE - INTERVAL '90 days'");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Riesgo de Abandono (Churn)", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getAuditoriaAnulaciones(ReporteFiltrosDTO filtros) {
        String sql = "SELECT operacion AS accion, tabla_afectada AS tabla, id_usuario AS usuario, fecha_hora AS fecha " +
                     "FROM seguridad.auditoria " +
                     "WHERE operacion ILIKE '%ANULAR%' OR operacion ILIKE '%AJUSTAR%' " +
                     "ORDER BY fecha_hora DESC";
        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Auditoría de Anulaciones", data);
    }
}
