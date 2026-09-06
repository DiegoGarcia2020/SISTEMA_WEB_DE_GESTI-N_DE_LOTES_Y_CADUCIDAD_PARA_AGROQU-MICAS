package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.Bodeguero;

import java.util.List;
import java.util.Optional;

public interface IBodegueroRepository extends JpaRepository<Bodeguero, Integer> {
    Optional<Bodeguero> findByUsuario_IdUsuario(Integer idUsuario);

    /** Bodegueros asignados a una bodega específica (Supervisor: ver mi equipo). */
    List<Bodeguero> findByAlmacen_IdAlmacen(Integer idAlmacen);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_crear_bodeguero(:correo, :contrasena, :idEstado, :cedula, :nombres, :apellidos, :telefono, :turno)", nativeQuery = true)
    void crearBodeguero(@Param("correo") String correo, @Param("contrasena") String contrasena, @Param("idEstado") Integer idEstado, @Param("cedula") String cedula, @Param("nombres") String nombres, @Param("apellidos") String apellidos, @Param("telefono") String telefono, @Param("turno") String turno);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_bodeguero(:idUsuario, :correo, :idEstado, :cedula, :nombres, :apellidos, :telefono, :turno)", nativeQuery = true)
    void actualizarBodeguero(@Param("idUsuario") Integer idUsuario, @Param("correo") String correo, @Param("idEstado") Integer idEstado, @Param("cedula") String cedula, @Param("nombres") String nombres, @Param("apellidos") String apellidos, @Param("telefono") String telefono, @Param("turno") String turno);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_eliminar_bodeguero(:idUsuario)", nativeQuery = true)
    void eliminarBodeguero(@Param("idUsuario") Integer idUsuario);
}
