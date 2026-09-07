package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.seguridad.Auditoria;

public interface IAuditoriaRepository extends JpaRepository<Auditoria, Integer> {

    @Query("SELECT a FROM Auditoria a LEFT JOIN a.usuario u WHERE " +
           "(:accion IS NULL OR a.accion = :accion) AND " +
           "(:q IS NULL OR LOWER(COALESCE(u.correo, '')) LIKE :q " +
           "  OR LOWER(COALESCE(a.tablaAfectada, '')) LIKE :q " +
           "  OR LOWER(COALESCE(a.descripcion, '')) LIKE :q)")
    Page<Auditoria> buscar(@Param("accion") String accion, @Param("q") String q, Pageable pageable);
}
