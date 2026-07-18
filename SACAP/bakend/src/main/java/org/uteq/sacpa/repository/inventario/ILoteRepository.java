package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.Lote;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio principal del sistema SACPA.
 * Maneja la entidad Lote y llama las funciones PL/pgSQL del esquema inventario.
 */
public interface ILoteRepository extends JpaRepository<Lote, Integer> {

    Optional<Lote> findByNumeroLote(String numeroLote);

    /** Lotes proximos a vencer segun fecha limite */
    @Query("SELECT l FROM Lote l WHERE l.fechaVencimiento <= :fechaLimite AND l.idEstadoLote = :idEstadoActivo ORDER BY l.fechaVencimiento ASC")
    List<Lote> findLotesProximosAVencer(@Param("fechaLimite") LocalDate fechaLimite, @Param("idEstadoActivo") Integer idEstadoActivo);

    /**
     * FEFO — lotes activos de un producto ordenados por fecha_vencimiento ASC.
     * Primer elemento = lote a despachar primero según FEFO.
     * Usado por el módulo de despachos (Módulo 4).
     */
    @Query("SELECT l FROM Lote l WHERE l.idEstadoLote = :idEstadoActivo ORDER BY l.fechaVencimiento ASC")
    List<Lote> findAllFEFO(@Param("idEstadoActivo") Integer idEstadoActivo);

    /** FEFO filtrado por producto */
    @Query("SELECT l FROM Lote l WHERE l.producto.idProducto = :idProducto AND l.idEstadoLote = :idEstadoActivo ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByProductoFEFO(@Param("idProducto") Integer idProducto, @Param("idEstadoActivo") Integer idEstadoActivo);

    /** Lotes en pre-registro (pendientes de validación del bodeguero) */
    @Query("SELECT l FROM Lote l WHERE l.idEstadoLote = :idEstadoPendiente ORDER BY l.fechaIngreso DESC")
    List<Lote> findLotesPendientesValidacion(@Param("idEstadoPendiente") Integer idEstadoPendiente);


    /** Lotes por proveedor */
    @Query("SELECT l FROM Lote l WHERE l.proveedor.idProveedor = :idProveedor ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByProveedor(@Param("idProveedor") Integer idProveedor);

    /** Lotes por producto */
    @Query("SELECT l FROM Lote l WHERE l.producto.idProducto = :idProducto ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByProducto(@Param("idProducto") Integer idProducto);

    // ============================================================
    // Llamadas a funciones PL/pgSQL del esquema inventario
    // ============================================================

    /**
     * Crea un nuevo lote.
     * Funcion BD: inventario.fn_crear_lote(p_numero_lote, p_fecha_fabricacion, p_fecha_vencimiento,
     *   p_cantidad_inicial, p_id_producto, p_id_proveedor, p_id_ubicacion, p_id_estado_lote)
     */
    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_crear_lote(:numeroLote, :fechaFabricacion, :fechaVencimiento, :cantidadInicial, :idProducto, :idProveedor, :idUbicacion, :idEstadoLote)", nativeQuery = true)
    void crearLote(@Param("numeroLote") String numeroLote,
                   @Param("fechaFabricacion") LocalDate fechaFabricacion,
                   @Param("fechaVencimiento") LocalDate fechaVencimiento,
                   @Param("cantidadInicial") Integer cantidadInicial,
                   @Param("idProducto") Integer idProducto,
                   @Param("idProveedor") Integer idProveedor,
                   @Param("idUbicacion") Integer idUbicacion,
                   @Param("idEstadoLote") Integer idEstadoLote);

    /**
     * Anula un lote.
     * Funcion BD: inventario.fn_anular_lote(p_id_lote)
     */
    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_anular_lote(:idLote)", nativeQuery = true)
    void anularLote(@Param("idLote") Integer idLote);
}
