package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.inventario.DocumentoInstitucional;

import java.util.List;

public interface IDocumentoInstitucionalRepository extends JpaRepository<DocumentoInstitucional, Integer> {

    @Query("SELECT d FROM DocumentoInstitucional d LEFT JOIN FETCH d.almacen JOIN FETCH d.usuarioSubida " +
           "WHERE (:idAlmacen IS NULL AND d.almacen IS NULL) OR d.almacen.idAlmacen = :idAlmacen " +
           "ORDER BY d.fechaSubida DESC")
    List<DocumentoInstitucional> findByAlmacen(@Param("idAlmacen") Integer idAlmacen);

    @Query("SELECT d FROM DocumentoInstitucional d LEFT JOIN FETCH d.almacen JOIN FETCH d.usuarioSubida ORDER BY d.fechaSubida DESC")
    List<DocumentoInstitucional> findAllConDetalle();
}
