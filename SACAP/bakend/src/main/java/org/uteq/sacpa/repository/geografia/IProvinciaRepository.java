package org.uteq.sacpa.repository.geografia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.geografia.Provincia;

import java.util.List;

public interface IProvinciaRepository extends JpaRepository<Provincia, Integer> {

    List<Provincia> findByPais_IdPais(Integer idPais);
    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_crear_provincia(:nombre, :idPais)", nativeQuery = true)
    void crearProvincia(@Param("nombre") String nombre, @Param("idPais") Integer idPais);

    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_actualizar_provincia(:idProvincia, :nuevoNombre, :idPais)", nativeQuery = true)
    void actualizarProvincia(@Param("idProvincia") Integer idProvincia, @Param("nuevoNombre") String nuevoNombre, @Param("idPais") Integer idPais);

    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_desactivar_provincia(:idProvincia)", nativeQuery = true)
    void desactivarProvincia(@Param("idProvincia") Integer idProvincia);
}
