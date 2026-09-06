package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.BodegueroDisponibleDTO;
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

    /** Bodegueros asignados actualmente a una bodega del supervisor ("Mi Equipo") */
    List<BodegueroDisponibleDTO> bodeguerosDeMiBodega(Integer idUsuarioAutenticado, Integer idAlmacen);

    /** Todos los usuarios con rol Bodeguero, con su bodega actual (o null si no tienen) */
    List<BodegueroDisponibleDTO> bodeguerosDisponibles(Integer idUsuarioAutenticado);

    /** Asigna (o reasigna) un bodeguero existente a una bodega del supervisor */
    BodegueroDisponibleDTO asignarBodeguero(Integer idUsuarioAutenticado, Integer idAlmacen, Integer idUsuarioBodeguero);

    /** Quita a un bodeguero de una bodega del supervisor */
    void quitarBodeguero(Integer idUsuarioAutenticado, Integer idAlmacen, Integer idUsuarioBodeguero);
}
