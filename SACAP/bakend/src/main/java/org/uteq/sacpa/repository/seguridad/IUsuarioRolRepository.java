package org.uteq.sacpa.repository.seguridad;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.seguridad.UsuarioRol;
import org.uteq.sacpa.entity.seguridad.UsuarioRolId;

public interface IUsuarioRolRepository extends JpaRepository<UsuarioRol, UsuarioRolId> {

    long countByRol_IdRol(Integer idRol);

    void deleteByRol_IdRol(Integer idRol);
}
