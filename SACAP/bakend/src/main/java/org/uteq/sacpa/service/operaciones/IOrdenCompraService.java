package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.OrdenCompraRequestDTO;
import org.uteq.sacpa.dto.operaciones.OrdenCompraResponseDTO;
import org.uteq.sacpa.dto.operaciones.RecepcionLoteRequestDTO;
import org.uteq.sacpa.entity.operaciones.OrdenCompra;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Interfaz del servicio de Órdenes de Compra.
 * Define las operaciones del Módulo 1: Compras e Inventario Inicial.
 */
public interface IOrdenCompraService {

    /**
     * Crea una nueva orden de compra con todos sus detalles.
     * El backend calcula automáticamente: valor_descuento, subtotal por ítem,
     * subtotal_bruto, total_descuentos, y total_neto.
     */
    OrdenCompra crearOrdenCompra(OrdenCompraRequestDTO dto);

    /**
     * Lista órdenes de compra con filtros opcionales.
     * @param estado      Filtrar por estado (PENDIENTE, RECEPCIONADA, ANULADA) — puede ser null
     * @param idProveedor Filtrar por proveedor — puede ser null
     * @param desde       Fecha de inicio del rango — puede ser null
     * @param hasta       Fecha fin del rango — puede ser null
     */
    List<OrdenCompraResponseDTO> listarOrdenes(String estado, Integer idProveedor, LocalDate desde, LocalDate hasta);

    /**
     * Obtiene una orden de compra por ID, incluyendo todos sus detalles con nombres de producto.
     */
    OrdenCompraResponseDTO obtenerPorId(Integer id);

    /**
     * Recepciona una orden de compra: confirma el ingreso físico y genera los lotes FLOTANTES.
     * Aplica la regla de negocio del COSTO PROMEDIO con bonificaciones:
     *   costoReal = totalPagado / totalUnidades (incluye regalos)
     */
    void recepcionarOrden(RecepcionLoteRequestDTO dto);

    /**
     * Anula una orden de compra. Solo se puede anular si está en estado PENDIENTE.
     */
    void anularOrden(Integer id);

    /**
     * MEMORIA DE PRECIOS: Obtiene el último precio unitario pagado por un producto.
     * Retorna null si no hay compras previas.
     */
    BigDecimal obtenerUltimoPrecioProducto(Integer idProducto);
}
