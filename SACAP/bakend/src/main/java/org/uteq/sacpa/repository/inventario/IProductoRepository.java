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
    @Query(value = "SELECT inventario.fn_crear_producto(:nombre, :descripcion, :unidadMedida, :precio, :idCategoria, :idEstado, :ingredienteActivo, :periodoCarenciaDias, :idToxicidad, :idFormulacion)", nativeQuery = true)
    void crearProducto(@Param("nombre") String nombre,
                       @Param("descripcion") String descripcion,
                       @Param("unidadMedida") String unidadMedida,
                       @Param("precio") BigDecimal precio,
                       @Param("idCategoria") Integer idCategoria,
                       @Param("idEstado") Integer idEstado,
                       @Param("ingredienteActivo") String ingredienteActivo,
                       @Param("periodoCarenciaDias") Integer periodoCarenciaDias,
                       @Param("idToxicidad") Integer idToxicidad,
                       @Param("idFormulacion") Integer idFormulacion);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_producto(:idProducto, :nombre, :descripcion, :unidadMedida, :precio, :idCategoria, :idEstado, :ingredienteActivo, :periodoCarenciaDias, :idToxicidad, :idFormulacion)", nativeQuery = true)
    void actualizarProducto(@Param("idProducto") Integer idProducto,
                            @Param("nombre") String nombre,
                            @Param("descripcion") String descripcion,
                            @Param("unidadMedida") String unidadMedida,
                            @Param("precio") BigDecimal precio,
                            @Param("idCategoria") Integer idCategoria,
                            @Param("idEstado") Integer idEstado,
                            @Param("ingredienteActivo") String ingredienteActivo,
                            @Param("periodoCarenciaDias") Integer periodoCarenciaDias,
                            @Param("idToxicidad") Integer idToxicidad,
                            @Param("idFormulacion") Integer idFormulacion);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_producto(:idProducto, :idEstadoInactivo)", nativeQuery = true)
    void desactivarProducto(@Param("idProducto") Integer idProducto, @Param("idEstadoInactivo") Integer idEstadoInactivo);

    /** Actualiza los campos IVA de un producto específico */
    @Modifying
    @Transactional
    @Query(value = "UPDATE inventario.producto SET aplica_iva = :aplicaIva, porcentaje_iva = :porcentajeIva WHERE id_producto = :idProducto", nativeQuery = true)
    void actualizarCamposIva(@Param("idProducto") Integer idProducto,
                             @Param("aplicaIva") Boolean aplicaIva,
                             @Param("porcentajeIva") BigDecimal porcentajeIva);

    /** Obtiene el ID del último producto creado (para actualizar IVA post-creación) */
    @Query(value = "SELECT MAX(id_producto) FROM inventario.producto", nativeQuery = true)
    Integer findMaxIdProducto();

    /** Propaga un cambio de IVA global: los productos con aplica_iva=true cuyo porcentaje excede el nuevo global se ajustan al nuevo valor */
    @Modifying
    @Transactional
    @Query(value = "UPDATE inventario.producto SET porcentaje_iva = :nuevoIva WHERE aplica_iva = true AND porcentaje_iva > :nuevoIva", nativeQuery = true)
    void ajustarIvaGlobal(@Param("nuevoIva") BigDecimal nuevoIva);
}
