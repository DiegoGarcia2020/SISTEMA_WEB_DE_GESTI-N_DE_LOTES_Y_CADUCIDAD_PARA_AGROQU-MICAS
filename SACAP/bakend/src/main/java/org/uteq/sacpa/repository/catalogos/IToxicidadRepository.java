package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.Toxicidad;

public interface IToxicidadRepository extends JpaRepository<Toxicidad, Integer> {
}
