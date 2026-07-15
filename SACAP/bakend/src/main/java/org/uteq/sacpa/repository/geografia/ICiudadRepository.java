package org.uteq.sacpa.repository.geografia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.geografia.Ciudad;

public interface ICiudadRepository extends JpaRepository<Ciudad, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_crear_ciudad(:nombre, :idProvincia)", nativeQuery = true)
    void crearCiudad(@Param("nombre") String nombre, @Param("idProvincia") Integer idProvincia);

    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_actualizar_ciudad(:idCiudad, :nuevoNombre, :idProvincia)", nativeQuery = true)
    void actualizarCiudad(@Param("idCiudad") Integer idCiudad, @Param("nuevoNombre") String nuevoNombre, @Param("idProvincia") Integer idProvincia);

    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_desactivar_ciudad(:idCiudad)", nativeQuery = true)
    void desactivarCiudad(@Param("idCiudad") Integer idCiudad);
}
