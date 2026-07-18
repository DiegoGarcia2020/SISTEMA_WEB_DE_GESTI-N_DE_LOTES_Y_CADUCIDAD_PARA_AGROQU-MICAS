package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.LotePreRegistroDTO;
import org.uteq.sacpa.dto.inventario.LoteRequestDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteValidacionDTO;
import org.uteq.sacpa.entity.inventario.Lote;

import java.time.LocalDate;
import java.util.List;

public interface ILoteService {

    /** Crea un nuevo lote usando la funcion PL/pgSQL inventario.fn_crear_lote */
    void crearLote(LoteRequestDTO dto);

    /** Pre-registro (Formulario A — Proveedor): crea lote en estado EN_REVISION */
    LoteResponseDTO preRegistrarLote(LotePreRegistroDTO dto);

    /** Validacion (Formulario B — Bodeguero): valida cantidad y asigna ubicacion, pasa a ACTIVO */
    LoteResponseDTO validarLote(Integer idLote, LoteValidacionDTO dto);

    /** Obtiene todos los lotes del sistema */
    List<LoteResponseDTO> listarTodos();

    /** Obtiene un lote por su numero de lote */
    LoteResponseDTO buscarPorNumeroLote(String numeroLote);

    /** Lista los lotes proximos a vencer en base a una fecha limite */
    List<LoteResponseDTO> listarLotesProximosAVencer(LocalDate fechaLimite, Integer idEstadoActivo);

    /**
     * FEFO: lista todos los lotes activos ordenados por fecha_vencimiento ASC.
     * Opcionalmente filtrado por idProducto.
     */
    List<LoteResponseDTO> listarFEFO(Integer idEstadoActivo, Integer idProducto);

    /** Lista lotes pendientes de validacion (estado EN_REVISION) */
    List<LoteResponseDTO> listarPendientesValidacion(Integer idEstadoPendiente);

    /** Anula un lote (funcion inventario.fn_anular_lote) */
    void anularLote(Integer idLote);
}
