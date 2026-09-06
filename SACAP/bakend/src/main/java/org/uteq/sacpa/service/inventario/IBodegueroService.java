package org.uteq.sacpa.service.inventario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.uteq.sacpa.dto.ia_alertas.AlertaCaducidadResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.MiBodegaDTO;
import org.uteq.sacpa.dto.inventario.NodoTopologiaDTO;
import org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO;
import org.uteq.sacpa.dto.operaciones.OrdenPendienteDespachoDTO;

import java.util.List;
import java.util.Optional;

/**
 * Operaciones del propio Bodeguero, acotadas a la bodega que le asignó su Supervisor.
 * Si el bodeguero todavía no tiene bodega asignada, miBodega() devuelve Optional.empty()
 * y el resto de los métodos deben devolver listas vacías (resueltas por el controller).
 */
public interface IBodegueroService {

    Optional<MiBodegaDTO> miBodega(Integer idUsuarioAutenticado);

    /** Resuelve el id de almacén del bodeguero autenticado, o vacío si no tiene bodega asignada. */
    Optional<Integer> resolverIdAlmacen(Integer idUsuarioAutenticado);

    List<LoteDisponibleDTO> lotesDisponiblesFefo(Integer idUsuarioAutenticado);

    Page<AlertaCaducidadResponseDTO> alertas(Integer idUsuarioAutenticado, Integer idEstadoActivo, Pageable pageable);

    List<OrdenPendienteDespachoDTO> despachosPendientes(Integer idUsuarioAutenticado, String busqueda);

    List<OrdenPendienteDespachoDTO> despachosPendientesEntrega(Integer idUsuarioAutenticado, String busqueda);

    /** Árbol de topología (zonas/estanterías/ubicaciones) acotado a mi bodega. Vacío si no tengo bodega asignada. */
    List<NodoTopologiaDTO> arbolTopologia(Integer idUsuarioAutenticado);

    /** Lotes "flotantes" (EN_REVISION, pendientes de ubicar) de mi bodega. */
    List<LoteResponseDTO> lotesPendientesDeUbicar(Integer idUsuarioAutenticado, Integer idEstadoPendiente);
}
