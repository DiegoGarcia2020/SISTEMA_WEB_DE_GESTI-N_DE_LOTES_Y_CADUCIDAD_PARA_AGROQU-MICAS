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
}
