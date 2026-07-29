package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.entidades.Cliente;

import java.util.List;

public interface IClienteRepository extends JpaRepository<Cliente, Integer> {

    List<Cliente> findByNombreContainingIgnoreCase(String nombre);

    /** El cliente recién creado (mayor id) — el insert se hace vía JdbcTemplate en el servicio */
    Cliente findTopByOrderByIdClienteDesc();
}
