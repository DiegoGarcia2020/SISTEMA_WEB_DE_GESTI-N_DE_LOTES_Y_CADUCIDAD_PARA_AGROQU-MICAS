package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.UbicacionInterna;

import java.util.List;


public interface IUbicacionInternaRepository extends JpaRepository<UbicacionInterna, Integer> {

    /** Cascada: ubicaciones pertenecientes a una estantería específica */
    List<UbicacionInterna> findByEstanteria_IdEstanteria(Integer idEstanteria);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_crear_ubicacion_interna(:nivel, :posicion, :idEstanteria)", nativeQuery = true)
    void crearUbicacionInterna(@Param("nivel") String nivel, @Param("posicion") String posicion, @Param("idEstanteria") Integer idEstanteria);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_ubicacion_interna(:idUbicacion, :nuevoNivel, :nuevaPosicion, :idEstanteria)", nativeQuery = true)
    void actualizarUbicacionInterna(@Param("idUbicacion") Integer idUbicacion, @Param("nuevoNivel") String nuevoNivel, @Param("nuevaPosicion") String nuevaPosicion, @Param("idEstanteria") Integer idEstanteria);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_ubicacion_interna(:idUbicacion)", nativeQuery = true)
    void desactivarUbicacionInterna(@Param("idUbicacion") Integer idUbicacion);
}
