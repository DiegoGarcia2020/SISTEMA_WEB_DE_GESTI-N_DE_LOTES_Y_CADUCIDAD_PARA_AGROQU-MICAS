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

/**
 * Implementacion de los reportes gerenciales de SACAP.
 *
 * REGLAS QUE APLICA ESTA CLASE (no modificar sin revisar el esquema real):
 *
 *  1. FILTRO DE FECHAS: operaciones.ventas.fecha es TIMESTAMP y el filtro
 *     llega como LocalDate. Usar BETWEEN excluye todo lo ocurrido despues
 *     de las 00:00 del ultimo dia. Por eso SIEMPRE se usa el patron
 *     media-abierto:  campo >= ?  AND  campo < (? + INTERVAL '1 day').
 *
 *  2. NOMBRES REALES DE COLUMNAS verificados contra el esquema:
 *       - operaciones.detalle_ventas   -> PK "id"  (NO id_detalle)
 *       - operaciones.movimientos_inventario -> "id_tipo_movimiento"
 *         (NO tipo_movimiento; el nombre legible esta en catalogos.cat_tipo_movimiento.nombre)
 *       - entidades.proveedor          -> "nombre_representante" (NO nombre_razon_social)
 *       - temporadas                   -> ia_alertas.temporadas_agricolas
 *         con "nombre_temporada" (NO operaciones.temporada, esa tabla no existe)
 *       - ia_alertas.alertas_caducidad -> "fecha_generada" (NOT NULL) y
 *         "fecha_generacion" (nullable); se usa COALESCE de ambas.
 *
 *  3. Todas las ventas ANULADAS se excluyen de los reportes de venta.
 */
@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements IReporteService {

    private final JdbcTemplate jdbcTemplate;
    private final IUsuarioRepository usuarioRepository;

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private Integer getUserId(String username) {
        if (username == null) return null;
        return usuarioRepository.findByCorreo(username)
                .map(u -> u.getIdUsuario())
                .orElse(null);
    }

    /** El catalogo seguridad.rol tiene dos variantes para tecnico. */
    private boolean esTecnico(String rol) {
        if (rol == null) return false;
        String r = rol.trim().toUpperCase();
        return r.equals("TECNICO")
            || r.equals("TECNICO_CAMPO")
            || r.equals("TÉCNICO DE CAMPO")
            || r.equals("TECNICO DE CAMPO");
    }

    private boolean esBodeguero(String rol) {
        return rol != null && rol.trim().equalsIgnoreCase("BODEGUERO");
    }

    private boolean esSupervisor(String rol) {
        return rol != null && rol.trim().equalsIgnoreCase("SUPERVISOR");
    }

    /**
     * Aplica el rango de fechas con el patron media-abierto.
     * Si solo viene una de las dos fechas, aplica solo ese extremo.
     */
    private void aplicarRangoFechas(StringBuilder sql, List<Object> params,
                                    ReporteFiltrosDTO f, String columna) {
        if (f == null) return;
        if (f.getFechaInicio() != null) {
            sql.append(" AND ").append(columna).append(" >= ? ");
            params.add(f.getFechaInicio());
        }
        if (f.getFechaFin() != null) {
            sql.append(" AND ").append(columna).append(" < (CAST(? AS date) + INTERVAL '1 day') ");
            params.add(f.getFechaFin());
        }
    }

    private void aplicarFiltro(StringBuilder sql, List<Object> params,
                               Integer valor, String condicion) {
        if (valor != null) {
            sql.append(" ").append(condicion).append(" ");
            params.add(valor);
        }
    }

    // ==================================================================
    // A. VENTAS Y RENTABILIDAD
    // ==================================================================

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosMasVendidos(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre AS producto, " +
            "       SUM(dv.cantidad) AS cantidad_vendida, " +
            "       SUM(dv.subtotal) AS total_generado " +
            "FROM operaciones.ventas v " +
            "JOIN operaciones.detalle_ventas dv ON v.id = dv.id_venta " +
            "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "WHERE v.estado <> 'ANULADA' "
        );
        List<Object> params = new ArrayList<>();

        if (esTecnico(rol)) {
            sql.append(" AND v.id_tecnico = ? ");
            params.add(getUserId(username));
        }
        aplicarRangoFechas(sql, params, f, "v.fecha");
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdProducto(),  "AND p.id_producto = ?");
            aplicarFiltro(sql, params, f.getIdCategoria(), "AND p.id_categoria = ?");
        }

        sql.append(" GROUP BY p.nombre ORDER BY cantidad_vendida DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Productos Más Vendidos", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosMayorGanancia(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre AS producto, " +
            "       SUM(dv.cantidad) AS unidades_vendidas, " +
            "       SUM(dv.subtotal) AS ingreso_total, " +
            "       SUM(COALESCE(l.costo_unitario_real, 0) * dv.cantidad) AS costo_total, " +
            "       SUM(dv.subtotal - (COALESCE(l.costo_unitario_real, 0) * dv.cantidad)) AS ganancia_total " +
            "FROM operaciones.detalle_ventas dv " +
            "JOIN operaciones.ventas v ON v.id = dv.id_venta " +
            "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "WHERE v.estado <> 'ANULADA' "
        );
        List<Object> params = new ArrayList<>();
        aplicarRangoFechas(sql, params, f, "v.fecha");
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdProducto(),  "AND p.id_producto = ?");
            aplicarFiltro(sql, params, f.getIdCategoria(), "AND p.id_categoria = ?");
        }
        sql.append(" GROUP BY p.nombre ORDER BY ganancia_total DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Productos con Mayor Ganancia", data);
    }

    /**
     * CORREGIDO: la version anterior consultaba operaciones.temporada, tabla
     * que no existe en ningun script. Las temporadas viven en
     * ia_alertas.temporadas_agricolas (columna nombre_temporada + cultivo).
     */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductoMayorDemandaTemporada(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT t.nombre_temporada AS temporada, " +
            "       t.cultivo          AS cultivo, " +
            "       p.nombre           AS producto, " +
            "       SUM(dv.cantidad)   AS cantidad_vendida, " +
            "       SUM(dv.subtotal)   AS total_generado " +
            "FROM operaciones.ventas v " +
            "JOIN operaciones.detalle_ventas dv ON v.id = dv.id_venta " +
            "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "JOIN ia_alertas.temporadas_agricolas t " +
            "       ON v.fecha >= t.fecha_inicio " +
            "      AND v.fecha <  (t.fecha_fin + INTERVAL '1 day') " +
            "WHERE v.estado <> 'ANULADA' "
        );
        List<Object> params = new ArrayList<>();
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdTemporada(), "AND t.id_temporada = ?");
            aplicarFiltro(sql, params, f.getIdProducto(),  "AND p.id_producto = ?");
        }
        sql.append(" GROUP BY t.nombre_temporada, t.cultivo, p.nombre ")
           .append(" ORDER BY t.nombre_temporada, cantidad_vendida DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Mayor Demanda por Temporada", data);
    }

    /**
     * CORREGIDO: to_char(fecha,'Day') rellena con espacios hasta 9 caracteres
     * ("Monday   ") y ordenar por conteo mezclaba el orden natural de la semana.
     */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getDiaMasCompras(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT TRIM(to_char(v.fecha, 'TMDay')) AS dia_semana, " +
            "       COUNT(v.id)                     AS total_ventas, " +
            "       SUM(v.total)                    AS monto_total " +
            "FROM operaciones.ventas v " +
            "WHERE v.estado <> 'ANULADA' "
        );
        List<Object> params = new ArrayList<>();
        aplicarRangoFechas(sql, params, f, "v.fecha");
        sql.append(" GROUP BY EXTRACT(ISODOW FROM v.fecha), TRIM(to_char(v.fecha, 'TMDay')) ")
           .append(" ORDER BY EXTRACT(ISODOW FROM v.fecha)");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Día con Más Compras", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getRotacionTemporada(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre AS producto, " +
            "       COUNT(*) AS lineas_vendidas, " +
            "       ROUND(AVG(v.fecha::date - l.fecha_ingreso::date), 1) AS dias_rotacion_promedio " +
            "FROM operaciones.detalle_ventas dv " +
            "JOIN operaciones.ventas v ON dv.id_venta = v.id " +
            "JOIN inventario.lotes l ON dv.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "WHERE l.fecha_ingreso IS NOT NULL " +
            "  AND v.estado <> 'ANULADA' " +
            "  AND v.fecha >= l.fecha_ingreso "
        );
        List<Object> params = new ArrayList<>();
        if (esTecnico(rol)) {
            sql.append(" AND v.id_tecnico = ? ");
            params.add(getUserId(username));
        }
        aplicarRangoFechas(sql, params, f, "v.fecha");
        sql.append(" GROUP BY p.nombre ORDER BY dias_rotacion_promedio ASC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Rotación Rápida de Inventario", data);
    }

    // ==================================================================
    // B. PROMOCIONES E IA
    // ==================================================================

    /** CORREGIDO: dv.id_detalle no existe; la PK de detalle_ventas es "id". */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getCombosMayorExito(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT pr.nombre_promocion         AS combo, " +
            "       pr.descuento_global         AS descuento_pct, " +
            "       COUNT(DISTINCT dv.id_venta) AS ventas_con_combo, " +
            "       COUNT(dv.id)                AS lineas_vendidas, " +
            "       SUM(dv.cantidad)            AS unidades_vendidas, " +
            "       SUM(dv.subtotal)            AS total_generado " +
            "FROM ia_alertas.promociones pr " +
            "JOIN operaciones.detalle_ventas dv ON dv.id_promocion = pr.id_promocion " +
            "JOIN operaciones.ventas v ON v.id = dv.id_venta " +
            "WHERE v.estado <> 'ANULADA' "
        );
        List<Object> params = new ArrayList<>();
        aplicarRangoFechas(sql, params, f, "v.fecha");
        sql.append(" GROUP BY pr.id_promocion, pr.nombre_promocion, pr.descuento_global ")
           .append(" ORDER BY unidades_vendidas DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Combos de Mayor Éxito", data);
    }

    /**
     * CORREGIDO: el JOIN directo contra gerencia.empleado descartaba a los
     * supervisores que no tienen ficha de empleado. Ahora se une por
     * seguridad.usuario y empleado queda como LEFT JOIN opcional.
     */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getEfectividadCombos(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT COALESCE(e.nombres || ' ' || e.apellidos, u.correo) AS supervisor, " +
            "       COUNT(DISTINCT pr.id_promocion)                     AS combos_aprobados, " +
            "       COUNT(DISTINCT dv.id_venta)                         AS ventas_generadas, " +
            "       COALESCE(SUM(dv.subtotal), 0)                       AS total_generado " +
            "FROM ia_alertas.promociones pr " +
            "JOIN seguridad.usuario u ON pr.id_usuario_aprueba = u.id_usuario " +
            "LEFT JOIN gerencia.empleado e ON e.id_usuario = u.id_usuario " +
            "LEFT JOIN operaciones.detalle_ventas dv ON dv.id_promocion = pr.id_promocion " +
            "LEFT JOIN operaciones.ventas v ON v.id = dv.id_venta AND v.estado <> 'ANULADA' " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        if (esSupervisor(rol)) {
            sql.append(" AND pr.id_usuario_aprueba = ? ");
            params.add(getUserId(username));
        }
        sql.append(" GROUP BY u.id_usuario, e.nombres, e.apellidos, u.correo ")
           .append(" ORDER BY ventas_generadas DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Efectividad de Combos Aprobados", data);
    }

    // ==================================================================
    // C. INVENTARIO Y CADUCIDAD
    // ==================================================================

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosPorCaducar(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre                             AS producto, " +
            "       l.numero_lote                        AS lote, " +
            "       l.cantidad_actual                    AS stock, " +
            "       l.fecha_vencimiento                  AS caducidad, " +
            "       (l.fecha_vencimiento - CURRENT_DATE) AS dias_restantes " +
            "FROM inventario.lotes l " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "WHERE l.cantidad_actual > 0 " +
            "  AND l.fecha_vencimiento >= CURRENT_DATE " +
            "  AND l.fecha_vencimiento <= CURRENT_DATE + 30 "
        );
        List<Object> params = new ArrayList<>();
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdProducto(),  "AND p.id_producto = ?");
            aplicarFiltro(sql, params, f.getIdCategoria(), "AND p.id_categoria = ?");
        }
        sql.append(" ORDER BY dias_restantes ASC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Productos Próximos a Caducar", data);
    }

    /**
     * CORREGIDO: agrupaba por (nombre, numero_lote), lo que mezclaba lotes de
     * productos distintos que compartieran numero. Ahora agrupa por l.id_lote.
     */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getArticulosEstancados(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre          AS producto, " +
            "       l.numero_lote     AS lote, " +
            "       l.cantidad_actual AS stock, " +
            "       COALESCE(MAX(v.fecha)::text, 'Sin ventas') AS ultima_venta, " +
            "       COALESCE(COALESCE(CURRENT_DATE - MAX(v.fecha)::date, " +
            "                CURRENT_DATE - l.fecha_ingreso::date), 0) AS dias_sin_movimiento " +
            "FROM inventario.lotes l " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "LEFT JOIN operaciones.detalle_ventas dv ON dv.id_lote = l.id_lote " +
            "LEFT JOIN operaciones.ventas v ON v.id = dv.id_venta AND v.estado <> 'ANULADA' " +
            "WHERE l.cantidad_actual > 0 "
        );
        List<Object> params = new ArrayList<>();
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdProducto(), "AND p.id_producto = ?");
        }
        sql.append(" GROUP BY l.id_lote, p.nombre, l.numero_lote, l.cantidad_actual, l.fecha_ingreso ")
           .append(" HAVING MAX(v.fecha) IS NULL OR MAX(v.fecha) < CURRENT_DATE - INTERVAL '60 days' ")
           .append(" ORDER BY dias_sin_movimiento DESC NULLS FIRST ")
           .append(" LIMIT 200");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Artículos Estancados", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getTotalInventarioAlmacenado(ReporteFiltrosDTO f, String rol) {
        boolean mostrarMontos = !esBodeguero(rol);

        StringBuilder sql = new StringBuilder(
            mostrarMontos
              ? "SELECT p.nombre AS producto, " +
                "       SUM(l.cantidad_actual) AS total_unidades, " +
                "       COUNT(DISTINCT l.id_lote) AS lotes, " +
                "       SUM(l.cantidad_actual * COALESCE(l.costo_unitario_real, 0)) AS valor_total "
              : "SELECT p.nombre AS producto, " +
                "       SUM(l.cantidad_actual) AS total_unidades, " +
                "       COUNT(DISTINCT l.id_lote) AS lotes "
        );
        sql.append("FROM inventario.lotes l ")
           .append("JOIN inventario.producto p ON l.id_producto = p.id_producto ")
           .append("WHERE l.cantidad_actual > 0 ");

        List<Object> params = new ArrayList<>();
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdCategoria(), "AND p.id_categoria = ?");
            aplicarFiltro(sql, params, f.getIdProducto(),  "AND p.id_producto = ?");
        }
        sql.append(" GROUP BY p.nombre ORDER BY total_unidades DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Total de Inventario Almacenado", data);
    }

    /**
     * CORREGIDO: m.tipo_movimiento no existe. La columna real es
     * m.id_tipo_movimiento y el nombre legible esta en
     * catalogos.cat_tipo_movimiento.nombre.
     */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getMovimientosPorProducto(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT m.fecha_movimiento AS fecha, " +
            "       p.nombre           AS producto, " +
            "       l.numero_lote      AS lote, " +
            "       tm.nombre          AS tipo_movimiento, " +
            "       tm.naturaleza      AS naturaleza, " +
            "       m.cantidad         AS cantidad, " +
            "       COALESCE(e.nombres || ' ' || e.apellidos, u.correo) AS usuario, " +
            "       m.observacion      AS observacion " +
            "FROM operaciones.movimientos_inventario m " +
            "JOIN catalogos.cat_tipo_movimiento tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento " +
            "JOIN inventario.lotes l ON m.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "LEFT JOIN seguridad.usuario u ON m.id_usuario = u.id_usuario " +
            "LEFT JOIN gerencia.empleado e ON e.id_usuario = u.id_usuario " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        aplicarRangoFechas(sql, params, f, "m.fecha_movimiento");
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdProducto(), "AND p.id_producto = ?");
        }
        sql.append(" ORDER BY m.fecha_movimiento DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Kardex de Movimientos", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getAlertasCriticas(ReporteFiltrosDTO f) {
        String sql =
            "SELECT COALESCE(ac.fecha_generacion, ac.fecha_generada) AS fecha, " +
            "       na.nombre           AS nivel_riesgo, " +
            "       p.nombre            AS producto, " +
            "       l.numero_lote       AS lote, " +
            "       l.cantidad_actual   AS stock, " +
            "       l.fecha_vencimiento AS caducidad, " +
            "       ac.mensaje          AS mensaje " +
            "FROM ia_alertas.alertas_caducidad ac " +
            "JOIN inventario.lotes l ON ac.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "JOIN catalogos.cat_nivel_alerta na ON ac.id_nivel_alerta = na.id_nivel_alerta " +
            "WHERE ac.id_estado = 1 " +
            "ORDER BY COALESCE(ac.fecha_generacion, ac.fecha_generada) DESC";

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql);
        return new ReporteRespuestaDTO("Alertas Críticas Activas", data);
    }

    /**
     * CORREGIDO: antes contaba cualquier venta con promocion del lote, aunque
     * fuera anterior a la alerta o posterior a la caducidad. Ahora exige que la
     * venta ocurra entre la generacion de la alerta y la fecha de vencimiento,
     * que es lo que realmente significa "salvado".
     */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getProductosSalvadosCaducidad(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre            AS producto, " +
            "       l.numero_lote       AS lote, " +
            "       l.fecha_vencimiento AS caducidad, " +
            "       SUM(dv.cantidad)    AS cantidad_salvada, " +
            "       SUM(dv.subtotal)    AS valor_recuperado " +
            "FROM ia_alertas.alertas_caducidad ac " +
            "JOIN inventario.lotes l ON ac.id_lote = l.id_lote " +
            "JOIN inventario.producto p ON l.id_producto = p.id_producto " +
            "JOIN operaciones.detalle_ventas dv ON dv.id_lote = l.id_lote AND dv.id_promocion IS NOT NULL " +
            "JOIN operaciones.ventas v ON v.id = dv.id_venta " +
            "WHERE v.estado <> 'ANULADA' " +
            "  AND v.fecha >= ac.fecha_generada " +
            "  AND v.fecha <  (l.fecha_vencimiento + INTERVAL '1 day') "
        );
        List<Object> params = new ArrayList<>();
        aplicarRangoFechas(sql, params, f, "v.fecha");
        sql.append(" GROUP BY l.id_lote, p.nombre, l.numero_lote, l.fecha_vencimiento ")
           .append(" ORDER BY cantidad_salvada DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Impacto IA: Productos Salvados", data);
    }

    // ==================================================================
    // D. OPERACION DE BODEGA
    // ==================================================================

    /** CORREGIDO: entidades.proveedor no tiene nombre_razon_social. */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getOrdenesPendientesDespacho(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT o.numero_factura         AS orden, " +
            "       p.nombre_representante   AS proveedor, " +
            "       p.ruc                    AS ruc, " +
            "       o.fecha_emision          AS emitida, " +
            "       o.fecha_llegada_estimada AS llegada_estimada, " +
            "       o.ventana_horaria        AS ventana, " +
            "       o.total_neto             AS total, " +
            "       (o.fecha_llegada_estimada - CURRENT_DATE) AS dias_para_llegada " +
            "FROM operaciones.orden_compra o " +
            "JOIN entidades.proveedor p ON o.id_proveedor = p.id_proveedor " +
            "WHERE o.estado = 'PENDIENTE' "
        );
        List<Object> params = new ArrayList<>();
        if (f != null) {
            if (f.getFechaInicio() != null) { sql.append(" AND o.fecha_emision >= ? "); params.add(f.getFechaInicio()); }
            if (f.getFechaFin()    != null) { sql.append(" AND o.fecha_emision <= ? "); params.add(f.getFechaFin()); }
        }
        sql.append(" ORDER BY o.fecha_llegada_estimada ASC NULLS LAST");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Órdenes de Compra Pendientes de Recepción", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getOrdenesDespachadasHoy(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT COALESCE(e.nombres || ' ' || e.apellidos, u.correo) AS bodeguero, " +
            "       COUNT(DISTINCT m.id_movimiento) AS despachos, " +
            "       SUM(m.cantidad)                 AS unidades_despachadas " +
            "FROM operaciones.movimientos_inventario m " +
            "JOIN catalogos.cat_tipo_movimiento tm ON m.id_tipo_movimiento = tm.id_tipo_movimiento " +
            "JOIN seguridad.usuario u ON m.id_usuario = u.id_usuario " +
            "LEFT JOIN gerencia.empleado e ON e.id_usuario = u.id_usuario " +
            "WHERE tm.naturaleza = 'SALIDA' "
        );
        List<Object> params = new ArrayList<>();

        // Si no llega rango, se usa el dia de hoy (comportamiento historico del reporte)
        if (f == null || (f.getFechaInicio() == null && f.getFechaFin() == null)) {
            sql.append(" AND m.fecha_movimiento >= CURRENT_DATE ")
               .append(" AND m.fecha_movimiento <  (CURRENT_DATE + INTERVAL '1 day') ");
        } else {
            aplicarRangoFechas(sql, params, f, "m.fecha_movimiento");
        }

        if (esBodeguero(rol)) {
            sql.append(" AND m.id_usuario = ? ");
            params.add(getUserId(username));
        }
        sql.append(" GROUP BY u.id_usuario, e.nombres, e.apellidos, u.correo ")
           .append(" ORDER BY despachos DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Rendimiento de Despacho", data);
    }

    // ==================================================================
    // E. CLIENTES
    // ==================================================================

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getClientesMasCompran(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT c.nombre_finca       AS cliente, " +
            "       c.cedula             AS cedula, " +
            "       COUNT(DISTINCT v.id) AS num_compras, " +
            "       SUM(v.total)         AS total_comprado " +
            "FROM operaciones.ventas v " +
            "JOIN entidades.clientes c ON v.id_cliente = c.id_cliente " +
            "WHERE v.estado <> 'ANULADA' "
        );
        List<Object> params = new ArrayList<>();
        if (esTecnico(rol)) {
            sql.append(" AND c.id_tecnico_asignado = ? ");
            params.add(getUserId(username));
        }
        if (f != null) {
            aplicarFiltro(sql, params, f.getIdCliente(), "AND c.id_cliente = ?");
        }
        aplicarRangoFechas(sql, params, f, "v.fecha");
        sql.append(" GROUP BY c.id_cliente, c.nombre_finca, c.cedula ")
           .append(" ORDER BY total_comprado DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Top Clientes", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getMercaderiaDevueltaPorMes(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT to_char(d.fecha_solicitud, 'YYYY-MM') AS mes, " +
            "       d.motivo                              AS motivo, " +
            "       COUNT(*)                              AS num_devoluciones, " +
            "       SUM(d.cantidad_devuelta)              AS unidades_devueltas " +
            "FROM operaciones.devoluciones_venta d " +
            "JOIN operaciones.ventas v ON d.id_venta = v.id " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        if (esTecnico(rol)) {
            sql.append(" AND v.id_tecnico = ? ");
            params.add(getUserId(username));
        }
        aplicarRangoFechas(sql, params, f, "d.fecha_solicitud");
        sql.append(" GROUP BY to_char(d.fecha_solicitud, 'YYYY-MM'), d.motivo ")
           .append(" ORDER BY mes DESC, num_devoluciones DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Análisis de Devoluciones", data);
    }

    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getClientesChurn(ReporteFiltrosDTO f, String username, String rol) {
        StringBuilder sql = new StringBuilder(
            "SELECT c.nombre_finca AS cliente, " +
            "       c.telefono     AS telefono, " +
            "       MAX(v.fecha)   AS ultima_compra, " +
            "       (CURRENT_DATE - MAX(v.fecha)::date) AS dias_sin_comprar, " +
            "       COUNT(v.id)    AS compras_historicas " +
            "FROM entidades.clientes c " +
            "JOIN operaciones.ventas v ON c.id_cliente = v.id_cliente AND v.estado <> 'ANULADA' " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        if (esTecnico(rol)) {
            sql.append(" AND c.id_tecnico_asignado = ? ");
            params.add(getUserId(username));
        }
        sql.append(" GROUP BY c.id_cliente, c.nombre_finca, c.telefono ")
           .append(" HAVING MAX(v.fecha) < CURRENT_DATE - INTERVAL '90 days' ")
           .append(" ORDER BY dias_sin_comprar DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Riesgo de Abandono (Churn)", data);
    }

    // ==================================================================
    // F. AUDITORIA
    // ==================================================================

    /**
     * CORREGIDO: seguridad.auditoria tiene "accion" (NOT NULL, historica) y
     * "operacion" (nullable, nueva). Filtrar solo por "operacion" descartaba
     * todos los registros historicos. Ahora se usa COALESCE de ambas, igual
     * que con fecha_hora / fecha.
     */
    @Override
    @Transactional(readOnly = true)
    public ReporteRespuestaDTO getAuditoriaAnulaciones(ReporteFiltrosDTO f) {
        StringBuilder sql = new StringBuilder(
            "SELECT COALESCE(a.fecha_hora, a.fecha)                     AS fecha, " +
            "       COALESCE(a.operacion, a.accion)                     AS accion, " +
            "       a.tabla_afectada                                    AS tabla, " +
            "       COALESCE(e.nombres || ' ' || e.apellidos, u.correo) AS usuario, " +
            "       a.descripcion                                       AS descripcion " +
            "FROM seguridad.auditoria a " +
            "LEFT JOIN seguridad.usuario u ON a.id_usuario = u.id_usuario " +
            "LEFT JOIN gerencia.empleado e ON e.id_usuario = u.id_usuario " +
            "WHERE (COALESCE(a.operacion, a.accion) ILIKE '%ANUL%' " +
            "    OR COALESCE(a.operacion, a.accion) ILIKE '%AJUST%' " +
            "    OR COALESCE(a.operacion, a.accion) ILIKE '%DELETE%' " +
            "    OR COALESCE(a.operacion, a.accion) ILIKE '%ELIMIN%') "
        );
        List<Object> params = new ArrayList<>();
        if (f != null) {
            if (f.getFechaInicio() != null) {
                sql.append(" AND COALESCE(a.fecha_hora, a.fecha) >= ? ");
                params.add(f.getFechaInicio());
            }
            if (f.getFechaFin() != null) {
                sql.append(" AND COALESCE(a.fecha_hora, a.fecha) < (CAST(? AS date) + INTERVAL '1 day') ");
                params.add(f.getFechaFin());
            }
        }
        sql.append(" ORDER BY fecha DESC");

        List<Map<String, Object>> data = jdbcTemplate.queryForList(sql.toString(), params.toArray());
        return new ReporteRespuestaDTO("Log de Anulaciones", data);
    }
}
