package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.seguridad.SolicitudRegistro;
import java.util.List;

@Repository
public interface ISolicitudRegistroRepository extends JpaRepository<SolicitudRegistro, Integer> {
    List<SolicitudRegistro> findByIdEstadoOrderByIdSolicitudDesc(Integer idEstado);
    List<SolicitudRegistro> findAllByOrderByIdSolicitudDesc();
}
