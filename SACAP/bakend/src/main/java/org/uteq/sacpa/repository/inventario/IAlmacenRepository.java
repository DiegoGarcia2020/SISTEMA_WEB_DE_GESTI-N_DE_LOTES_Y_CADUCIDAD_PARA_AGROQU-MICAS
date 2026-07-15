package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.Almacen;

import java.math.BigDecimal;

public interface IAlmacenRepository extends JpaRepository<Almacen, Integer> {

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_crear_almacen(:nombre, :capacidadTotal, :idCiudad)", nativeQuery = true)
    void crearAlmacen(@Param("nombre") String nombre,
                      @Param("capacidadTotal") BigDecimal capacidadTotal,
                      @Param("idCiudad") Integer idCiudad);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_almacen(:idAlmacen, :nombre, :capacidadTotal, :idCiudad)", nativeQuery = true)
    void actualizarAlmacen(@Param("idAlmacen") Integer idAlmacen,
                           @Param("nombre") String nombre,
                           @Param("capacidadTotal") BigDecimal capacidadTotal,
                           @Param("idCiudad") Integer idCiudad);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_almacen(:idAlmacen)", nativeQuery = true)
    void desactivarAlmacen(@Param("idAlmacen") Integer idAlmacen);
}
