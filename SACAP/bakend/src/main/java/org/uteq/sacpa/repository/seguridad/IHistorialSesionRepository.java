package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.seguridad.HistorialSesion;

public interface IHistorialSesionRepository extends JpaRepository<HistorialSesion, Integer> {
}
