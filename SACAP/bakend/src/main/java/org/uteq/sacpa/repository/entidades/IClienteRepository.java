package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.entidades.Cliente;

import java.util.List;
import java.util.Optional;

public interface IClienteRepository extends JpaRepository<Cliente, Integer> {

    Optional<Cliente> findByCedula(String cedula);

    List<Cliente> findByTecnicoAsignado_IdUsuario(Integer idUsuario);

    List<Cliente> findByNombreFincaContainingIgnoreCaseOrCedulaContainingIgnoreCase(String nombreFinca, String cedula);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Cliente c WHERE c.tecnicoAsignado.idUsuario = :idTecnico " +
           "AND (LOWER(c.nombreFinca) LIKE LOWER(CONCAT('%', :texto, '%')) " +
           "     OR c.cedula LIKE CONCAT('%', :texto, '%'))")
    List<Cliente> buscarPorTecnico(@org.springframework.data.repository.query.Param("idTecnico") Integer idTecnico, @org.springframework.data.repository.query.Param("texto") String texto);
}
