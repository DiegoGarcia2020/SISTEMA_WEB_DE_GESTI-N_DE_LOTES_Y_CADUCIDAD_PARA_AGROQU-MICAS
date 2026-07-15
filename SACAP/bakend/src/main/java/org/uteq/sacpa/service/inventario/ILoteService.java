package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.LoteRequestDTO;
import org.uteq.sacpa.entity.inventario.Lote;

import java.time.LocalDate;
import java.util.List;

public interface ILoteService {
    
    /** Crea un nuevo lote usando la funcion PL/pgSQL inventario.fn_crear_lote */
    void crearLote(LoteRequestDTO dto);

    /** Obtiene todos los lotes del sistema */
    List<Lote> listarTodos();

    /** Obtiene un lote por su numero de lote */
    Lote buscarPorNumeroLote(String numeroLote);

    /** Lista los lotes proximos a vencer en base a una fecha limite */
    List<Lote> listarLotesProximosAVencer(LocalDate fechaLimite, Integer idEstadoActivo);

    /** Anula un lote (funcion inventario.fn_anular_lote) */
    void anularLote(Integer idLote);
}
