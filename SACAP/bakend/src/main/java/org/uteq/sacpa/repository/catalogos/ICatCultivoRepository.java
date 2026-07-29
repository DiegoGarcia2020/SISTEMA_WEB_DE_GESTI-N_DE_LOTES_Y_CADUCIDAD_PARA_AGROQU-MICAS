package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.CatCultivo;

import java.util.List;

public interface ICatCultivoRepository extends JpaRepository<CatCultivo, Integer> {
    List<CatCultivo> findByIdEstadoOrderByNombreAsc(Integer idEstado);
}
