package org.uteq.sacpa.service.seguridad;

import org.uteq.sacpa.entity.seguridad.Rol;
import org.uteq.sacpa.entity.seguridad.RolBD;
import java.util.List;
import java.util.Map;

public interface IRolService {
    List<Rol> listarRoles();
    Rol obtenerRolPorId(Integer id);
    Rol crearRol(Map<String, Object> datos);
    Rol actualizarRol(Integer id, Map<String, Object> datos);
    void cambiarEstadoRol(Integer id, Integer idEstado);
    void eliminarRol(Integer id);

    List<RolBD> listarRolesBd();
    RolBD crearRolBd(Map<String, Object> datos);
    RolBD actualizarRolBd(Integer id, Map<String, Object> datos);
    void cambiarEstadoRolBd(Integer id, Boolean activo);
}
