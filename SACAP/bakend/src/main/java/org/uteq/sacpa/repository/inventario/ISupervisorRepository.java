package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.Supervisor;

import java.util.Optional;

public interface ISupervisorRepository extends JpaRepository<Supervisor, Integer> {
    Optional<Supervisor> findByUsuario_IdUsuario(Integer idUsuario);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_crear_supervisor(:correo, :contrasena, :idEstado, :cedula, :nombres, :apellidos, :telefono, :areaSupervision)", nativeQuery = true)
    void crearSupervisor(@Param("correo") String correo, @Param("contrasena") String contrasena, @Param("idEstado") Integer idEstado, @Param("cedula") String cedula, @Param("nombres") String nombres, @Param("apellidos") String apellidos, @Param("telefono") String telefono, @Param("areaSupervision") String areaSupervision);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_supervisor(:idUsuario, :correo, :idEstado, :cedula, :nombres, :apellidos, :telefono, :areaSupervision)", nativeQuery = true)
    void actualizarSupervisor(@Param("idUsuario") Integer idUsuario, @Param("correo") String correo, @Param("idEstado") Integer idEstado, @Param("cedula") String cedula, @Param("nombres") String nombres, @Param("apellidos") String apellidos, @Param("telefono") String telefono, @Param("areaSupervision") String areaSupervision);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_eliminar_supervisor(:idUsuario)", nativeQuery = true)
    void eliminarSupervisor(@Param("idUsuario") Integer idUsuario);
}
