package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.ia_alertas.Promocion;

import java.util.List;

public interface IPromocionRepository extends JpaRepository<Promocion, Integer> {

    List<Promocion> findBySugerencia_IdSugerencia(Integer idSugerencia);


    List<Promocion> findByIdEstado(Integer idEstado);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_promocion(:nombrePromocion, :descripcion, :descuentoGlobal, :fechaInicio, :fechaFin, :idSugerencia, :idUsuarioAprueba, :idEstado)", nativeQuery = true)
    void crearPromocion(@Param("nombrePromocion") String nombrePromocion,
                        @Param("descripcion") String descripcion,
                        @Param("descuentoGlobal") BigDecimal descuentoGlobal,
                        @Param("fechaInicio") LocalDate fechaInicio,
                        @Param("fechaFin") LocalDate fechaFin,
                        @Param("idSugerencia") Integer idSugerencia,
                        @Param("idUsuarioAprueba") Integer idUsuarioAprueba,
                        @Param("idEstado") Integer idEstado);

    List<Promocion> findByEstado_IdEstadoPromocion(Integer idEstadoPromocion);
}
