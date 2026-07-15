package org.uteq.sacpa.repository.gerencia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.gerencia.Gerente;

import java.util.Optional;

public interface IGerenteRepository extends JpaRepository<Gerente, Integer> {
    Optional<Gerente> findByUsuario_IdUsuario(Integer idUsuario);

    @Modifying @Transactional
    @Query(value = "SELECT gerencia.fn_crear_gerente(:correo, :contrasena, :idEstado, :cedula, :nombres, :apellidos, :telefono)", nativeQuery = true)
    void crearGerente(@Param("correo") String correo, @Param("contrasena") String contrasena, @Param("idEstado") Integer idEstado, @Param("cedula") String cedula, @Param("nombres") String nombres, @Param("apellidos") String apellidos, @Param("telefono") String telefono);

    @Modifying @Transactional
    @Query(value = "SELECT gerencia.fn_actualizar_gerente(:idUsuario, :correo, :idEstado, :cedula, :nombres, :apellidos, :telefono)", nativeQuery = true)
    void actualizarGerente(@Param("idUsuario") Integer idUsuario, @Param("correo") String correo, @Param("idEstado") Integer idEstado, @Param("cedula") String cedula, @Param("nombres") String nombres, @Param("apellidos") String apellidos, @Param("telefono") String telefono);

    @Modifying @Transactional
    @Query(value = "SELECT gerencia.fn_eliminar_gerente(:idUsuario)", nativeQuery = true)
    void eliminarGerente(@Param("idUsuario") Integer idUsuario);
}
