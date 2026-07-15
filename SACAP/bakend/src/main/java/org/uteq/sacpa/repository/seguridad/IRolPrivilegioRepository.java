package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.seguridad.RolPrivilegio;

import java.util.List;

public interface IRolPrivilegioRepository extends JpaRepository<RolPrivilegio, Integer> {
    List<RolPrivilegio> findByRol_IdRol(Integer idRol);
    void deleteByRol_IdRol(Integer idRol);
}
