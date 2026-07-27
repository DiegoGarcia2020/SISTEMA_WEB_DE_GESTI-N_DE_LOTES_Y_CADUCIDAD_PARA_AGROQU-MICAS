package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.entity.operaciones.Venta;

public interface IDespachoService {
    Venta marcarComoPreparada(Integer idVenta);
    Venta confirmarEntrega(Integer idVenta);
}
