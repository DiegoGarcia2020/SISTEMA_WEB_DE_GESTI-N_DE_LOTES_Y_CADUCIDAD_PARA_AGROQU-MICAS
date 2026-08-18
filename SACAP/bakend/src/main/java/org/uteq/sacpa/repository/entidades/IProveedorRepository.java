package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.entidades.Proveedor;

import java.util.Optional;

public interface IProveedorRepository extends JpaRepository<Proveedor, Integer> {

    Optional<Proveedor> findByRuc(String ruc);
    boolean existsByRuc(String ruc);

    @Query(value = "SELECT id_proveedor FROM entidades.proveedor WHERE id_usuario = :idUsuario LIMIT 1", nativeQuery = true)
    Optional<Integer> findIdProveedorByIdUsuario(@Param("idUsuario") Integer idUsuario);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"empresa", "ciudad"})
    @Query("SELECT p FROM Proveedor p WHERE " +
           "(:q IS NULL OR :q = '' OR " +
           "LOWER(p.ruc) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.nombreRepresentante) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.empresa.nombre) LIKE LOWER(CONCAT('%', :q, '%')))")
    org.springframework.data.domain.Page<Proveedor> findByFiltro(@Param("q") String q, org.springframework.data.domain.Pageable pageable);
}
