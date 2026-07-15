package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.seguridad.Auditoria;

public interface IAuditoriaRepository extends JpaRepository<Auditoria, Integer> {
}
