package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.ZonaAlmacen;

public interface IZonaAlmacenRepository extends JpaRepository<ZonaAlmacen, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_crear_zona_almacen(:nombre, :condicionClimatica, :idAlmacen)", nativeQuery = true)
    void crearZonaAlmacen(@Param("nombre") String nombre, @Param("condicionClimatica") String condicionClimatica, @Param("idAlmacen") Integer idAlmacen);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_zona_almacen(:idZona, :nuevoNombre, :nuevaCondicion)", nativeQuery = true)
    void actualizarZonaAlmacen(@Param("idZona") Integer idZona, @Param("nuevoNombre") String nuevoNombre, @Param("nuevaCondicion") String nuevaCondicion);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_zona_almacen(:idZona)", nativeQuery = true)
    void desactivarZonaAlmacen(@Param("idZona") Integer idZona);
}
