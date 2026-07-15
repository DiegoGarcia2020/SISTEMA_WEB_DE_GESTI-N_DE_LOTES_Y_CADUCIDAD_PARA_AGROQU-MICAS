package org.uteq.sacpa.service.seguridad;

import org.uteq.sacpa.dto.seguridad.EsquemaPrivilegiosDTO;
import org.uteq.sacpa.entity.seguridad.Privilegio;
import org.uteq.sacpa.entity.seguridad.RolPrivilegio;
import org.uteq.sacpa.entity.seguridad.TipoObjetoSeguridad;

import java.util.List;
import java.util.Map;

public interface IPrivilegioService {
    List<Privilegio> listarPrivilegios();
    List<EsquemaPrivilegiosDTO> listarPrivilegiosAgrupados();
    Privilegio crearPrivilegio(Map<String, Object> datos);
    Privilegio actualizarPrivilegio(Integer id, Map<String, Object> datos);
    void desactivarPrivilegio(Integer id);

    List<TipoObjetoSeguridad> listarTiposObjeto();
    TipoObjetoSeguridad crearTipoObjeto(Map<String, Object> datos);

    List<RolPrivilegio> listarPrivilegiosPorRol(Integer idRol);
    void asignarPrivilegiosARol(Integer idRol, List<Integer> idPrivilegios);
}
