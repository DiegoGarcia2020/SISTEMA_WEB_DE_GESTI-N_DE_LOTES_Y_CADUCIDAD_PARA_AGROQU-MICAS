package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.ReglaNegocioIA;

import java.math.BigDecimal;
import java.util.List;

public interface IReglaNegocioIARepository extends JpaRepository<ReglaNegocioIA, Integer> {

    List<ReglaNegocioIA> findByActivoTrue();

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_regla_negocio_ia(:descuentoMaximo, :activarPromociones)", nativeQuery = true)
    void crearRegla(@Param("descuentoMaximo") BigDecimal descuentoMaximo,
                    @Param("activarPromociones") Boolean activarPromociones);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_actualizar_regla_negocio_ia(:idRegla, :descuentoMaximo, :activarPromociones)", nativeQuery = true)
    void actualizarRegla(@Param("idRegla") Integer idRegla,
                         @Param("descuentoMaximo") BigDecimal descuentoMaximo,
                         @Param("activarPromociones") Boolean activarPromociones);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_desactivar_regla_negocio_ia(:idRegla)", nativeQuery = true)
    void desactivarRegla(@Param("idRegla") Integer idRegla);
}
