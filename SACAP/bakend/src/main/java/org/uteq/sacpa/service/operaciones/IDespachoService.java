package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.DesgloseLoteDespachoDTO;
import org.uteq.sacpa.dto.operaciones.OrdenPendienteDespachoDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;

import java.util.List;

public interface IDespachoService {
    /**
     * Ventas CONFIRMADAS, pendientes de que Bodega arme el paquete físico.
     * @param busqueda opcional: filtra por N° de comprobante o ID (null/vacío = las 50 más recientes).
     */
    List<OrdenPendienteDespachoDTO> listarPendientesPreparar(String busqueda);
    List<DesgloseLoteDespachoDTO> obtenerLotesADespachar(Integer idVenta);

    VentaResponseDTO marcarComoPreparada(Integer idVenta);
    VentaResponseDTO confirmarEntrega(Integer idVenta);
}
