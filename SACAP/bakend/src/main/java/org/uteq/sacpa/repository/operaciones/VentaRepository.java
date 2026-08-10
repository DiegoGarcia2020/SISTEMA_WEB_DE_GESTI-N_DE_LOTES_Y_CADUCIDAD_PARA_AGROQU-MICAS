package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.operaciones.Venta;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {

    List<Venta> findByTecnico_IdUsuario(Integer idUsuario);

    /** Historial del técnico, más recientes primero. */
    List<Venta> findByTecnico_IdUsuarioOrderByFechaDesc(Integer idUsuario);
    List<Venta> findTop100ByTecnico_IdUsuarioOrderByFechaDesc(Integer idUsuario);

    Optional<Venta> findByNumeroComprobante(String numeroComprobante);
}
