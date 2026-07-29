package org.uteq.sacpa.repository.catalogos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.catalogos.CatPlaga;

import java.util.List;

public interface ICatPlagaRepository extends JpaRepository<CatPlaga, Integer> {
    List<CatPlaga> findByIdEstadoOrderByNombreAsc(Integer idEstado);
}
