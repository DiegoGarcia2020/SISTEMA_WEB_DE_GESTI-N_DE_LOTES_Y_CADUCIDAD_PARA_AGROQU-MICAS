package org.uteq.sacpa.repository.geografia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.geografia.Pais;

public interface IPaisRepository extends JpaRepository<Pais, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_crear_pais(:nombre, :codigoIso)", nativeQuery = true)
    void crearPais(@Param("nombre") String nombre, @Param("codigoIso") String codigoIso);

    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_actualizar_pais(:idPais, :nuevoNombre, :codigoIso)", nativeQuery = true)
    void actualizarPais(@Param("idPais") Integer idPais, @Param("nuevoNombre") String nuevoNombre, @Param("codigoIso") String codigoIso);

    @Modifying @Transactional
    @Query(value = "SELECT geografia.fn_desactivar_pais(:idPais)", nativeQuery = true)
    void desactivarPais(@Param("idPais") Integer idPais);
}
