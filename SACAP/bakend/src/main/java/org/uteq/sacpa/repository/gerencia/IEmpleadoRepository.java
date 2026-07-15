package org.uteq.sacpa.repository.gerencia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.uteq.sacpa.entity.gerencia.Empleado;
import java.util.Optional;

@Repository
public interface IEmpleadoRepository extends JpaRepository<Empleado, Integer> {
    Optional<Empleado> findByCedula(String cedula);
    Optional<Empleado> findByUsuario_IdUsuario(Integer idUsuario);
}
