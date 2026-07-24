package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.OrdenPedidoRequestDTO;
import org.uteq.sacpa.dto.operaciones.UsoCampoRequestDTO;
import org.uteq.sacpa.entity.operaciones.UsoCampo;

import java.time.LocalDate;
import java.util.List;

public interface IUsoCampoService {

    // ── Uso de Campo Clásico (Agrícola) ──────────────────────────────────
    void crearUsoCampo(UsoCampoRequestDTO dto);

    List<UsoCampo> buscarPorLote(Integer idLote);

    void anularUsoCampo(Integer idUsoCampo, Integer idEstadoAnulado);

    List<UsoCampo> listarTodos();

    List<UsoCampo> listarFiltrado(LocalDate fechaInicio, LocalDate fechaFin, String cultivo);

    // ── Orden de Pedido (Ventas) ──────────────────────────────────────────

    /** Técnico crea un pedido, reserva stock en el lote. */
    void crearOrdenPedido(OrdenPedidoRequestDTO dto);

    /** Lista los pedidos generados por un técnico específico. */
    List<UsoCampo> listarPedidosPorTecnico(Integer idTecnico);

    /** Lista pedidos en estado PENDIENTE_BODEGA para el bodeguero. */
    List<UsoCampo> listarPedidosPendientesBodega();

    /** Bodeguero despacha el pedido: libera reserva, resta stock, registra movimiento. */
    void despacharPedido(Integer idOrden, Integer idUsuarioBodeguero);

    /** Devolución de cliente: suma stock de vuelta al lote inmediatamente. */
    void registrarDevolucionCliente(Integer idPedidoOriginal, String motivo,
                                    Integer cantidad, Integer idLote, Integer idUsuario);
}
