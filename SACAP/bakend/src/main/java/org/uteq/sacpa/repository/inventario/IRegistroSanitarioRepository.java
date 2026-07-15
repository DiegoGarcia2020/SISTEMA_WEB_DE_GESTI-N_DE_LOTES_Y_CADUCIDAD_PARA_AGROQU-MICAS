package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.RegistroSanitario;

import java.time.LocalDate;

public interface IRegistroSanitarioRepository extends JpaRepository<RegistroSanitario, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_crear_registro_sanitario(:numeroRegistro, :organismoEmisor, :fechaEmision, :fechaVigencia, :idProducto, :idEstado)", nativeQuery = true)
    void crearRegistroSanitario(@Param("numeroRegistro") String numeroRegistro, @Param("organismoEmisor") String organismoEmisor, @Param("fechaEmision") LocalDate fechaEmision, @Param("fechaVigencia") LocalDate fechaVigencia, @Param("idProducto") Integer idProducto, @Param("idEstado") Integer idEstado);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_registro_sanitario(:idRegistro, :nuevoNumero, :nuevoOrganismo, :fechaEmision, :fechaVigencia, :idEstado)", nativeQuery = true)
    void actualizarRegistroSanitario(@Param("idRegistro") Integer idRegistro, @Param("nuevoNumero") String nuevoNumero, @Param("nuevoOrganismo") String nuevoOrganismo, @Param("fechaEmision") LocalDate fechaEmision, @Param("fechaVigencia") LocalDate fechaVigencia, @Param("idEstado") Integer idEstado);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_registro_sanitario(:idRegistro, :idEstadoInactivo)", nativeQuery = true)
    void desactivarRegistroSanitario(@Param("idRegistro") Integer idRegistro, @Param("idEstadoInactivo") Integer idEstadoInactivo);
}
