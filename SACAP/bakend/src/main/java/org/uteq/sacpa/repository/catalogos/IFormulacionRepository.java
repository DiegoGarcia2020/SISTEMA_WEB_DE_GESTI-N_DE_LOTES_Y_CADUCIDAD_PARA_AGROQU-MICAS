package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.Formulacion;

public interface IFormulacionRepository extends JpaRepository<Formulacion, Integer> {
}
