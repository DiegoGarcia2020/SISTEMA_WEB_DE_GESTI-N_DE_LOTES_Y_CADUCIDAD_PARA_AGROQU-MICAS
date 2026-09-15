package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.RecetaAgricola;

import java.util.List;
import java.util.Optional;

@Repository
public interface IRecetaAgricolaRepository extends JpaRepository<RecetaAgricola, Integer> {

    /** Receta sin usar de un cliente para un producto puntual — la que el checkout consume. */
    @Query("SELECT r FROM RecetaAgricola r WHERE r.idReceta = :idReceta " +
           "AND r.cliente.idCliente = :idCliente AND r.producto.idProducto = :idProducto AND r.usada = false")
    Optional<RecetaAgricola> findDisponible(@Param("idReceta") Integer idReceta,
                                             @Param("idCliente") Integer idCliente,
                                             @Param("idProducto") Integer idProducto);

    /** JOIN FETCH obligatorio: RecetaAgricolaResponseDTO.from() lee cliente/producto (LAZY)
     *  fuera de la sesión de Hibernate si no se traen aquí. */
    @Query("SELECT r FROM RecetaAgricola r JOIN FETCH r.cliente JOIN FETCH r.producto " +
           "WHERE r.cliente.idCliente = :idCliente AND r.usada = :usada ORDER BY r.fechaEmision DESC")
    List<RecetaAgricola> findByCliente_IdClienteAndUsadaOrderByFechaEmisionDesc(@Param("idCliente") Integer idCliente, @Param("usada") Boolean usada);
}
