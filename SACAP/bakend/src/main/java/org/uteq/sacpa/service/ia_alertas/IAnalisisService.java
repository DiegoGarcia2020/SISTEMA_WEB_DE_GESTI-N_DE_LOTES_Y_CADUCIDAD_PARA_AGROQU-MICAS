package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.analisis.*;
import java.time.LocalDateTime;
import java.util.List;

public interface IAnalisisService {

    List<ProductoMayorIngresoDTO> mayorIngreso(String periodo);

    List<DemandaTemporadaDTO> demandaTemporada(Integer idTemporada);

    List<LoteProximoVencerDTO> lotesProximosAVencer(Integer dias);

    List<ProductoEstancadoDTO> productosEstancados();

    List<InventarioTotalDTO> inventarioTotal();

    List<MovimientoProductoDTO> movimientosPorRango(LocalDateTime desde, LocalDateTime hasta);

    Object estadisticasPromociones();

    List<ProductoSalvadoDTO> productosSalvados();

    List<UsuarioAnulacionDTO> usuariosConAnulaciones(Integer semanas);

    List<DiaCompraDTO> ventasPorDiaSemana(String periodo);

    List<ClienteFrecuenteDTO> clientesFrecuentes();

    List<DevolucionMensualDTO> devolucionesMensuales(Integer meses);

    List<ProductoTemporadaDTO> productosPorTemporada();

    List<ClienteChurnDTO> clientesChurn();
}
