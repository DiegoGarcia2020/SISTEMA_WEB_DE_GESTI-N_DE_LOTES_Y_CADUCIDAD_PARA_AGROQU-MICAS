package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.inventario.HistorialEstadoLote;

public interface IHistorialEstadoLoteRepository extends JpaRepository<HistorialEstadoLote, Integer> {
}
