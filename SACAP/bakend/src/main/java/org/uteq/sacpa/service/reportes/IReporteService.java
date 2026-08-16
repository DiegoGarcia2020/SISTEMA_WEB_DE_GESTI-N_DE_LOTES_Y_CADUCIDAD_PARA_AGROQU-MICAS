package org.uteq.sacpa.service.reportes;

import org.uteq.sacpa.dto.reportes.ReporteFiltrosDTO;
import org.uteq.sacpa.dto.reportes.ReporteRespuestaDTO;

public interface IReporteService {
    // A. Ventas y Rentabilidad
    ReporteRespuestaDTO getProductosMasVendidos(ReporteFiltrosDTO filtros, String username, String rol);
    ReporteRespuestaDTO getProductosMayorGanancia(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getProductoMayorDemandaTemporada(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getDiaMasCompras(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getRotacionTemporada(ReporteFiltrosDTO filtros, String username, String rol);

    // B. Promociones
    ReporteRespuestaDTO getCombosMayorExito(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getEfectividadCombos(ReporteFiltrosDTO filtros, String username, String rol);

    // C. Inventario y Caducidad
    ReporteRespuestaDTO getProductosPorCaducar(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getArticulosEstancados(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getTotalInventarioAlmacenado(ReporteFiltrosDTO filtros, String rol);
    ReporteRespuestaDTO getMovimientosPorProducto(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getAlertasCriticas(ReporteFiltrosDTO filtros);
    ReporteRespuestaDTO getProductosSalvadosCaducidad(ReporteFiltrosDTO filtros, String username, String rol);

    // D. Operacion de Bodega
    ReporteRespuestaDTO getOrdenesPendientesDespacho(ReporteFiltrosDTO filtros, String username, String rol);
    ReporteRespuestaDTO getOrdenesDespachadasHoy(ReporteFiltrosDTO filtros, String username, String rol);

    // E. Clientes y Geografia
    ReporteRespuestaDTO getClientesMasCompran(ReporteFiltrosDTO filtros, String username, String rol);
    ReporteRespuestaDTO getMercaderiaDevueltaPorMes(ReporteFiltrosDTO filtros, String username, String rol);
    ReporteRespuestaDTO getClientesChurn(ReporteFiltrosDTO filtros, String username, String rol);

    // F. Auditoria
    ReporteRespuestaDTO getAuditoriaAnulaciones(ReporteFiltrosDTO filtros);
}
