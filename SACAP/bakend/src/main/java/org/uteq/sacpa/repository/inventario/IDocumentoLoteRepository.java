package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.DocumentoLote;

import java.util.List;

public interface IDocumentoLoteRepository extends JpaRepository<DocumentoLote, Integer> {

    List<DocumentoLote> findByLote_IdLote(Integer idLote);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_crear_documento_lote(:nombreArchivo, :rutaArchivo, :tipoDocumento, :idLote)", nativeQuery = true)
    void crearDocumento(@Param("nombreArchivo") String nombreArchivo,
                        @Param("rutaArchivo") String rutaArchivo,
                        @Param("tipoDocumento") String tipoDocumento,
                        @Param("idLote") Integer idLote);

    @Modifying
    @Transactional
    @Query(value = "SELECT inventario.fn_eliminar_documento_lote(:idDocumento)", nativeQuery = true)
    void eliminarDocumento(@Param("idDocumento") Integer idDocumento);
}
