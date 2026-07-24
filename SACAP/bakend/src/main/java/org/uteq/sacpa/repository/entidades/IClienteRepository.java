package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.entidades.Cliente;

import java.util.List;
import java.util.Optional;

public interface IClienteRepository extends JpaRepository<Cliente, Integer> {

    Optional<Cliente> findByCedula(String cedula);

    List<Cliente> findByTecnicoAsignado_IdUsuario(Integer idUsuario);

    @Modifying
    @Transactional
    @Query(value = "SELECT entidades.fn_crear_cliente(:nombreFinca, :cedula, :telefono, :direccion, :idTecnico)",
           nativeQuery = true)
    void crearCliente(@Param("nombreFinca") String nombreFinca,
                      @Param("cedula") String cedula,
                      @Param("telefono") String telefono,
                      @Param("direccion") String direccion,
                      @Param("idTecnico") Integer idTecnico);
}
