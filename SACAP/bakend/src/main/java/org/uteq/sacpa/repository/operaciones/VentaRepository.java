package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {

    List<Venta> findByTecnico_IdUsuario(Integer idUsuario);

    /** Historial del técnico, más recientes primero. */
    List<Venta> findByTecnico_IdUsuarioOrderByFechaDesc(Integer idUsuario);
    List<Venta> findTop100ByTecnico_IdUsuarioOrderByFechaDesc(Integer idUsuario);

    /**
     * Ventas del técnico dentro de un rango de fechas. Reemplaza el patrón de
     * traer TODO el histórico y filtrar el día en memoria, que con ~167k filas
     * de prueba dejaba el dashboard colgado en "Cargando panel...".
     */
    @Query("SELECT v FROM Venta v WHERE v.tecnico.idUsuario = :idUsuario " +
           "AND v.fecha >= :desde AND v.fecha < :hasta ORDER BY v.fecha DESC")
    List<Venta> findPorTecnicoEnRango(@Param("idUsuario") Integer idUsuario,
                                      @Param("desde") LocalDateTime desde,
                                      @Param("hasta") LocalDateTime hasta);

    Optional<Venta> findByNumeroComprobante(String numeroComprobante);

    /**
     * Ventas confirmadas, pendientes de que Bodega arme el paquete físico.
     * Más recientes primero: acotado a 50 y con ~167k filas de datos de prueba en
     * CONFIRMADA, ordenar ascendente enterraba las ventas nuevas detrás de años
     * de filas viejas y nunca aparecían en el top 50.
     */
    List<Venta> findTop50ByEstadoOrderByFechaDesc(String estado);

    /**
     * Igual que arriba, pero filtrando por N° de comprobante o ID — para cuando la
     * venta buscada no está entre las 50 más recientes. El texto de búsqueda se
     * normaliza a "" (nunca null) antes de llamar esto: igual que en
     * ILoteRepository.findLotesDisponibles, un parámetro null dentro de
     * LOWER(CONCAT(...)) hace que Postgres no pueda inferir el tipo y falla con
     * "function lower(bytea) does not exist".
     */
    @Query("SELECT v FROM Venta v WHERE v.estado = :estado " +
           "AND (LOWER(v.numeroComprobante) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR CAST(v.id AS string) LIKE CONCAT('%', :busqueda, '%')) " +
           "ORDER BY v.fecha DESC")
    List<Venta> buscarPendientesPreparar(@Param("estado") String estado, @Param("busqueda") String busqueda, Pageable pageable);
}
