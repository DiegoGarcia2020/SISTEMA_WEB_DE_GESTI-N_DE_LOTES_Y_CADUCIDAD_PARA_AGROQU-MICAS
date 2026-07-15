package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.operaciones.UsoCampo;

import java.time.LocalDate;
import java.util.List;

public interface IUsoCampoRepository extends JpaRepository<UsoCampo, Integer> {

    List<UsoCampo> findByLote_IdLote(Integer idLote);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_crear_uso_campo(:parcela, :cultivo, :fechaAplicacion, :cantidadUsada, :observacion, :idLote, :idUsuarioTecnico)", nativeQuery = true)
    void crearUsoCampo(@Param("parcela") String parcela,
                       @Param("cultivo") String cultivo,
                       @Param("fechaAplicacion") LocalDate fechaAplicacion,
                       @Param("cantidadUsada") Integer cantidadUsada,
                       @Param("observacion") String observacion,
                       @Param("idLote") Integer idLote,
                       @Param("idUsuarioTecnico") Integer idUsuarioTecnico);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_actualizar_uso_campo(:idUso, :parcela, :cultivo, :fechaAplicacion, :observacion)", nativeQuery = true)
    void actualizarUsoCampo(@Param("idUso") Integer idUso,
                            @Param("parcela") String parcela,
                            @Param("cultivo") String cultivo,
                            @Param("fechaAplicacion") LocalDate fechaAplicacion,
                            @Param("observacion") String observacion);

    @Modifying
    @Transactional
    @Query(value = "SELECT operaciones.fn_anular_uso_campo(:idUso)", nativeQuery = true)
    void anularUsoCampo(@Param("idUso") Integer idUso);
}
