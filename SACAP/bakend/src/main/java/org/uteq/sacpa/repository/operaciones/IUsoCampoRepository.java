package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.operaciones.UsoCampo;

import java.util.List;

public interface IUsoCampoRepository extends JpaRepository<UsoCampo, Integer> {

    List<UsoCampo> findByLote_IdLote(Integer idLote);

    // ── Consultas para el flujo de Ventas (Órdenes de Pedido) ──────────────
    List<UsoCampo> findByTecnico_IdUsuarioAndTipoRegistro(Integer idUsuario, String tipoRegistro);

    List<UsoCampo> findByTipoRegistroAndIdEstadoPedido(String tipoRegistro, Integer idEstadoPedido);

    // Nota: las funciones PL/pgSQL (fn_crear_uso_campo, fn_actualizar_uso_campo, fn_anular_uso_campo,
    // fn_crear_orden_pedido, fn_despachar_pedido, fn_devolucion_cliente) se llaman desde
    // UsoCampoServiceImpl vía JdbcTemplate, no aquí — @Modifying + nativeQuery falla en Postgres
    // para cualquier función invocada como "SELECT funcion(...)" (siempre devuelve una fila,
    // y executeUpdate() no lo tolera). Ver ProveedorServiceImpl para el mismo patrón.
}

