package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteSupervisorRequestDTO;
import org.uteq.sacpa.dto.inventario.MiBodegaDTO;
import org.uteq.sacpa.entity.inventario.Categoria;

import java.util.List;

/**
 * Operaciones del Dashboard del Supervisor (Módulo 2):
 * ver sus bodegas asignadas y crear/consultar lotes con categoría dentro de ellas.
 */
public interface ISupervisorService {

    /** Bodegas asignadas al supervisor vinculado al usuario autenticado */
    List<MiBodegaDTO> misBodegas(Integer idUsuarioAutenticado);

    /** Lotes de una bodega del supervisor, opcionalmente filtrados por categoría de producto */
    List<LoteResponseDTO> misLotes(Integer idUsuarioAutenticado, Integer idAlmacen, Integer idCategoria);

    /** Crea un lote "flotante" (sin ubicación física aún) dentro de una bodega del supervisor */
    LoteResponseDTO crearLote(Integer idUsuarioAutenticado, LoteSupervisorRequestDTO dto);

    /** Categorías de producto activas, para el selector del formulario de creación */
    List<Categoria> categoriasActivas();
}
