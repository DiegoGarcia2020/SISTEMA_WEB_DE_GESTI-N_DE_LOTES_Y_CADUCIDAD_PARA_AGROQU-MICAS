package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.entidades.Proveedor;

import java.util.Optional;

public interface IProveedorRepository extends JpaRepository<Proveedor, Integer> {

    Optional<Proveedor> findByRuc(String ruc);
    boolean existsByRuc(String ruc);


    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_crear_proveedor(:idEstado, :ruc, :nombreRepresentante, :direccion, :telefono, :telefonoEmpresa, :correoContacto, :idEmpresa, :idCiudad)", nativeQuery = true)
    void crearProveedor(@Param("idEstado") Integer idEstado, @Param("ruc") String ruc, @Param("nombreRepresentante") String nombreRepresentante, @Param("direccion") String direccion, @Param("telefono") String telefono, @Param("telefonoEmpresa") String telefonoEmpresa, @Param("correoContacto") String correoContacto, @Param("idEmpresa") Integer idEmpresa, @Param("idCiudad") Integer idCiudad);

    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_actualizar_proveedor(:idProveedor, :idEstado, :ruc, :nombreRepresentante, :direccion, :telefono, :telefonoEmpresa, :correoContacto, :idEmpresa, :idCiudad)", nativeQuery = true)
    void actualizarProveedor(@Param("idProveedor") Integer idProveedor, @Param("idEstado") Integer idEstado, @Param("ruc") String ruc, @Param("nombreRepresentante") String nombreRepresentante, @Param("direccion") String direccion, @Param("telefono") String telefono, @Param("telefonoEmpresa") String telefonoEmpresa, @Param("correoContacto") String correoContacto, @Param("idEmpresa") Integer idEmpresa, @Param("idCiudad") Integer idCiudad);

    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_eliminar_proveedor(:idProveedor)", nativeQuery = true)
    void eliminarProveedor(@Param("idProveedor") Integer idProveedor);
}
