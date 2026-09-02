package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.seguridad.Auditoria;

import java.util.List;

public interface IAuditoriaRepository extends JpaRepository<Auditoria, Integer> {
    List<Auditoria> findAllByOrderByFechaHoraDesc(Pageable pageable);
}
