package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.PromocionDetalle;

import java.util.List;

public interface IPromocionDetalleRepository extends JpaRepository<PromocionDetalle, Integer> {

    List<PromocionDetalle> findByPromocion_IdPromocion(Integer idPromocion);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_promocion_detalle(:idPromocion, :idProducto, :cantidadRequerida)", nativeQuery = true)
    void crearDetalle(@Param("idPromocion") Integer idPromocion,
                      @Param("idProducto") Integer idProducto,
                      @Param("cantidadRequerida") Integer cantidadRequerida);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_actualizar_promocion_detail(:idDetalle, :idProducto, :cantidadRequerida)", nativeQuery = true)
    void actualizarDetalle(@Param("idDetalle") Integer idDetalle,
                           @Param("idProducto") Integer idProducto,
                           @Param("cantidadRequerida") Integer cantidadRequerida);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_eliminar_promocion_detalle(:idDetalle)", nativeQuery = true)
    void eliminarDetalle(@Param("idDetalle") Integer idDetalle);
}
