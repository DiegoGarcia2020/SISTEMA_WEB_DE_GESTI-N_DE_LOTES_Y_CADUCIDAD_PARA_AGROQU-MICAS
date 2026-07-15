package org.uteq.sacpa.repository.ia_alertas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.ia_alertas.ModeloIA;

import java.util.List;

public interface IModeloIARepository extends JpaRepository<ModeloIA, Integer> {

    List<ModeloIA> findByActivoTrue();

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_crear_modelo_ia(:nombreModelo, :version, :descripcion)", nativeQuery = true)
    void crearModelo(@Param("nombreModelo") String nombreModelo,
                     @Param("version") String version,
                     @Param("descripcion") String descripcion);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_actualizar_modelo_ia(:idModelo, :nombreModelo, :version, :descripcion)", nativeQuery = true)
    void actualizarModelo(@Param("idModelo") Integer idModelo,
                          @Param("nombreModelo") String nombreModelo,
                          @Param("version") String version,
                          @Param("descripcion") String descripcion);

    @Modifying
    @Transactional
    @Query(value = "SELECT ia_alertas.fn_desactivar_modelo_ia(:idModelo)", nativeQuery = true)
    void desactivarModelo(@Param("idModelo") Integer idModelo);
}
