package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.entidades.Empresa;

public interface IEmpresaRepository extends JpaRepository<Empresa, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_crear_empresa(:nombre, :direccion, :telefono, :correo, :idCiudad, :idEstado)", nativeQuery = true)
    void crearEmpresa(@Param("nombre") String nombre, @Param("direccion") String direccion, @Param("telefono") String telefono, @Param("correo") String correo, @Param("idCiudad") Integer idCiudad, @Param("idEstado") Integer idEstado);

    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_actualizar_empresa(:idEmpresa, :nuevoNombre, :nuevaDireccion, :nuevoTelefono, :nuevoCorreo, :idCiudad, :idEstado)", nativeQuery = true)
    void actualizarEmpresa(@Param("idEmpresa") Integer idEmpresa, @Param("nuevoNombre") String nuevoNombre, @Param("nuevaDireccion") String nuevaDireccion, @Param("nuevoTelefono") String nuevoTelefono, @Param("nuevoCorreo") String nuevoCorreo, @Param("idCiudad") Integer idCiudad, @Param("idEstado") Integer idEstado);

    @Modifying @Transactional
    @Query(value = "SELECT entidades.fn_desactivar_empresa(:idEmpresa, :idEstadoInactivo)", nativeQuery = true)
    void desactivarEmpresa(@Param("idEmpresa") Integer idEmpresa, @Param("idEstadoInactivo") Integer idEstadoInactivo);
}
