package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.operaciones.TecnicoCampo;

import java.util.Optional;

public interface ITecnicoCampoRepository extends JpaRepository<TecnicoCampo, Integer> {

    Optional<TecnicoCampo> findByUsuario_IdUsuario(Integer idUsuario);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_crear_tecnico(:correo, :contrasena, :idEstado, :cedula, :nombres, :apellidos, :telefono, :licenciaAgricola)", nativeQuery = true)
    void crearTecnico(@Param("correo") String correo,
                      @Param("contrasena") String contrasena,
                      @Param("idEstado") Integer idEstado,
                      @Param("cedula") String cedula,
                      @Param("nombres") String nombres,
                      @Param("apellidos") String apellidos,
                      @Param("telefono") String telefono,
                      @Param("licenciaAgricola") String licenciaAgricola);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_actualizar_tecnico(:idUsuario, :correo, :idEstado, :cedula, :nombres, :apellidos, :telefono, :licenciaAgricola)", nativeQuery = true)
    void actualizarTecnico(@Param("idUsuario") Integer idUsuario,
                           @Param("correo") String correo,
                           @Param("idEstado") Integer idEstado,
                           @Param("cedula") String cedula,
                           @Param("nombres") String nombres,
                           @Param("apellidos") String apellidos,
                           @Param("telefono") String telefono,
                           @Param("licenciaAgricola") String licenciaAgricola);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_eliminar_tecnico(:idUsuario)", nativeQuery = true)
    void eliminarTecnico(@Param("idUsuario") Integer idUsuario);
}
