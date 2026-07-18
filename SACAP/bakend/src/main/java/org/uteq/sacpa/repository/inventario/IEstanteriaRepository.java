package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.Estanteria;

import java.util.List;


public interface IEstanteriaRepository extends JpaRepository<Estanteria, Integer> {

    /** Cascada: estanterías pertenecientes a una zona específica */
    List<Estanteria> findByZona_IdZona(Integer idZona);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_crear_estanteria(:codigo, :idZona)", nativeQuery = true)
    void crearEstanteria(@Param("codigo") String codigo, @Param("idZona") Integer idZona);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_estanteria(:idEstanteria, :nuevoCodigo, :idZona)", nativeQuery = true)
    void actualizarEstanteria(@Param("idEstanteria") Integer idEstanteria, @Param("nuevoCodigo") String nuevoCodigo, @Param("idZona") Integer idZona);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_estanteria(:idEstanteria)", nativeQuery = true)
    void desactivarEstanteria(@Param("idEstanteria") Integer idEstanteria);
}
