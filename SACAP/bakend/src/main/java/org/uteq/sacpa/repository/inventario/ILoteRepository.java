package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.LockModeType;
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

    /**
     * Unidades realmente ocupadas por ubicación física, calculado en vivo sumando
     * cantidad_actual de los lotes que apuntan ahí — reemplaza el contador
     * ubicacion_interna.capacidad_actual, que solo se incrementaba al recibir/asignar
     * lotes manualmente y nunca se descontaba (quedaba desincronizado de la venta real).
     */
    @Query("SELECT l.ubicacion.idUbicacion, COALESCE(SUM(l.cantidadActual), 0) FROM Lote l " +
           "WHERE l.ubicacion IS NOT NULL GROUP BY l.ubicacion.idUbicacion")
    List<Object[]> sumCantidadActualAgrupadoPorUbicacion();

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

    /** Lotes almacenados en una ubicación específica */
    List<Lote> findByUbicacion_IdUbicacion(Integer idUbicacion);


    /** Lotes por proveedor */
    @Query("SELECT l FROM Lote l WHERE l.proveedor.idProveedor = :idProveedor ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByProveedor(@Param("idProveedor") Integer idProveedor);

    /** Lotes por producto */
    @Query("SELECT l FROM Lote l WHERE l.producto.idProducto = :idProducto ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByProducto(@Param("idProducto") Integer idProducto);

    /** Igual que findByProducto pero con bloqueo pesimista, para despachos/reintegros concurrentes (FEFO) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Lote l WHERE l.producto.idProducto = :idProducto ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByProductoForUpdate(@Param("idProducto") Integer idProducto);

    /** Lote puntual con bloqueo pesimista, para descontar stock en ventas concurrentes sin sobrevender */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Lote l WHERE l.idLote = :idLote")
    Optional<Lote> findByIdForUpdate(@Param("idLote") Integer idLote);

    /** Todos los lotes con stock realmente disponible (cantidad_actual - cantidad_reservada > 0), orden FEFO */
    @Query("SELECT l FROM Lote l WHERE l.producto.idEstado = 1 AND l.idEstadoLote = 1 AND l.fechaVencimiento > CURRENT_DATE AND (l.cantidadActual - COALESCE(l.cantidadReservada, 0)) > 0 " +
           "AND EXISTS (SELECT 1 FROM org.uteq.sacpa.entity.entidades.ProveedorProducto pp WHERE pp.producto.idProducto = l.producto.idProducto AND pp.idEstado = 1) " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findLotesDisponiblesFefo();

    @Query("SELECT l FROM Lote l JOIN l.producto p WHERE l.producto.idEstado = 1 AND l.idEstadoLote = 1 AND l.fechaVencimiento > CURRENT_DATE AND (l.cantidadActual - COALESCE(l.cantidadReservada, 0)) > 0 " +
           "AND EXISTS (SELECT 1 FROM org.uteq.sacpa.entity.entidades.ProveedorProducto pp WHERE pp.producto.idProducto = l.producto.idProducto AND pp.idEstado = 1) " +
           "AND (:busqueda IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(l.numeroLote) LIKE LOWER(CONCAT('%', :busqueda, '%'))) " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findLotesDisponibles(@Param("busqueda") String busqueda);


    /**
     * Lotes de un almacén específico (Supervisor: ver lotes de mis bodegas asignadas).
     * Incluye lotes ya ubicados físicamente (navega lote → ubicacion → estanteria → zona → almacen)
     * y lotes "flotantes" creados por el Supervisor que aún no tienen ubicación asignada
     * por el Bodeguero (navega lote → almacen directamente).
     */
    @Query("SELECT l FROM Lote l " +
           "LEFT JOIN l.ubicacion u LEFT JOIN u.estanteria e LEFT JOIN e.zona z LEFT JOIN z.almacen za " +
           "WHERE " +
           "(u IS NOT NULL AND za.idAlmacen = :idAlmacen) OR " +
           "(u IS NULL AND l.almacen.idAlmacen = :idAlmacen) " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByAlmacen(@Param("idAlmacen") Integer idAlmacen);

    /** Lotes de un almacén (ubicados o flotantes) filtrados por categoría de producto */
    @Query("SELECT l FROM Lote l " +
           "LEFT JOIN l.ubicacion u LEFT JOIN u.estanteria e LEFT JOIN e.zona z LEFT JOIN z.almacen za " +
           "WHERE " +
           "((u IS NOT NULL AND za.idAlmacen = :idAlmacen) OR " +
           "(u IS NULL AND l.almacen.idAlmacen = :idAlmacen)) " +
           "AND l.producto.categoria.idCategoria = :idCategoria ORDER BY l.fechaVencimiento ASC")
    List<Lote> findByAlmacenYCategoria(@Param("idAlmacen") Integer idAlmacen, @Param("idCategoria") Integer idCategoria);

    /**
     * Lotes disponibles para vender (Módulo 3): solo lotes ya ubicados físicamente por el
     * Bodeguero (nunca "flotantes"), de la categoría pedida, con stock realmente libre
     * (cantidad_actual - cantidad_reservada > 0). Orden FEFO.
     */
    @Query("SELECT l FROM Lote l WHERE l.ubicacion IS NOT NULL " +
           "AND l.producto.categoria.idCategoria = :idCategoria " +
           "AND l.idEstadoLote = :idEstadoActivo " +
           "AND l.fechaVencimiento > CURRENT_DATE " +
           "AND (l.cantidadActual - COALESCE(l.cantidadReservada, 0)) > 0 " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findDisponiblesParaVenta(@Param("idCategoria") Integer idCategoria, @Param("idEstadoActivo") Integer idEstadoActivo);

    /**
     * Lotes disponibles para vender (Módulo 3 — diagnóstico por plaga): igual que
     * findDisponiblesParaVenta pero el filtro duro es la plaga que trata el producto
     * (etiqueta N:M producto_plaga), con cultivo opcional para acotar más el diagnóstico.
     */
    @Query("SELECT DISTINCT l FROM Lote l JOIN l.producto.plagas pl WHERE l.ubicacion IS NOT NULL " +
           "AND pl.idPlaga = :idPlaga " +
           "AND (:idCultivo IS NULL OR EXISTS (SELECT 1 FROM l.producto.cultivos c WHERE c.idCultivo = :idCultivo)) " +
           "AND l.idEstadoLote = :idEstadoActivo " +
           "AND l.fechaVencimiento > CURRENT_DATE " +
           "AND (l.cantidadActual - COALESCE(l.cantidadReservada, 0)) > 0 " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findDisponiblesParaVentaPorPlaga(@Param("idPlaga") Integer idPlaga, @Param("idCultivo") Integer idCultivo, @Param("idEstadoActivo") Integer idEstadoActivo);

    @Query("SELECT l FROM Lote l " +
           "LEFT JOIN FETCH l.ubicacion u LEFT JOIN FETCH u.estanteria e " +
           "LEFT JOIN FETCH e.zona z LEFT JOIN FETCH z.almacen a " +
           "LEFT JOIN FETCH l.almacen a2 " +
           "WHERE l.producto.idProducto = :idProducto " +
           "AND l.cantidadActual > 0 " +
           "ORDER BY l.fechaVencimiento ASC")
    List<Lote> findUbicacionesPorProducto(@Param("idProducto") Integer idProducto);

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
