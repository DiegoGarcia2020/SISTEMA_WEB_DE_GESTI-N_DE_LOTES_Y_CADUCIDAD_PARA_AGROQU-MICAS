package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.Producto;

import java.math.BigDecimal;
import java.util.List;

public interface IProductoRepository extends JpaRepository<Producto, Integer> {

    List<Producto> findByCategoria_IdCategoria(Integer idCategoria);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_crear_producto(:nombre, :descripcion, :unidadMedida, :precio, :idCategoria, :idEstado)", nativeQuery = true)
    void crearProducto(@Param("nombre") String nombre,
                       @Param("descripcion") String descripcion,
                       @Param("unidadMedida") String unidadMedida,
                       @Param("precio") BigDecimal precio,
                       @Param("idCategoria") Integer idCategoria,
                       @Param("idEstado") Integer idEstado);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_producto(:idProducto, :nombre, :descripcion, :unidadMedida, :precio, :idCategoria, :idEstado)", nativeQuery = true)
    void actualizarProducto(@Param("idProducto") Integer idProducto,
                            @Param("nombre") String nombre,
                            @Param("descripcion") String descripcion,
                            @Param("unidadMedida") String unidadMedida,
                            @Param("precio") BigDecimal precio,
                            @Param("idCategoria") Integer idCategoria,
                            @Param("idEstado") Integer idEstado);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_producto(:idProducto, :idEstadoInactivo)", nativeQuery = true)
    void desactivarProducto(@Param("idProducto") Integer idProducto, @Param("idEstadoInactivo") Integer idEstadoInactivo);
}
