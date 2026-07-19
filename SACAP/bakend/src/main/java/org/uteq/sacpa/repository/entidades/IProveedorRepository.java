package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.entidades.Proveedor;

import java.util.Optional;

public interface IProveedorRepository extends JpaRepository<Proveedor, Integer> {

    @Query(value = "SELECT id_proveedor FROM entidades.proveedor WHERE id_usuario = :idUsuario LIMIT 1", nativeQuery = true)
    Optional<Integer> findIdProveedorByIdUsuario(@Param("idUsuario") Integer idUsuario);

    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_crear_proveedor(:correo, :contrasena, :idEstado, :ruc, :nombreRepresentante, :direccion, :telefonoEmpresa, :idEmpresa, :idCiudad)", nativeQuery = true)
    void crearProveedor(@Param("correo") String correo, @Param("contrasena") String contrasena, @Param("idEstado") Integer idEstado, @Param("ruc") String ruc, @Param("nombreRepresentante") String nombreRepresentante, @Param("direccion") String direccion, @Param("telefonoEmpresa") String telefonoEmpresa, @Param("idEmpresa") Integer idEmpresa, @Param("idCiudad") Integer idCiudad);

    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_actualizar_proveedor(:idUsuario, :correo, :idEstado, :ruc, :nombreRepresentante, :direccion, :telefonoEmpresa, :idEmpresa, :idCiudad)", nativeQuery = true)
    void actualizarProveedor(@Param("idUsuario") Integer idUsuario, @Param("correo") String correo, @Param("idEstado") Integer idEstado, @Param("ruc") String ruc, @Param("nombreRepresentante") String nombreRepresentante, @Param("direccion") String direccion, @Param("telefonoEmpresa") String telefonoEmpresa, @Param("idEmpresa") Integer idEmpresa, @Param("idCiudad") Integer idCiudad);

    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_eliminar_proveedor(:idUsuario)", nativeQuery = true)
    void eliminarProveedor(@Param("idUsuario") Integer idUsuario);
}
