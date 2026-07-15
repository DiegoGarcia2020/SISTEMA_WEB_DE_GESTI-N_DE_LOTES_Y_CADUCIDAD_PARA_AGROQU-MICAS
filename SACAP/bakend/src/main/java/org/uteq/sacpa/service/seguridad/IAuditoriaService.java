package org.uteq.sacpa.service.seguridad;

import org.uteq.sacpa.entity.seguridad.Auditoria;
import org.uteq.sacpa.entity.seguridad.HistorialSesion;

import java.util.List;
import java.util.Map;

public interface IAuditoriaService {
    List<Auditoria> listarAuditoria();
    Auditoria registrarAuditoria(Map<String, Object> datos);

    List<HistorialSesion> listarHistorialSesiones();
    List<HistorialSesion> listarSesionesPorUsuario(Integer idUsuario);
    void registrarIngresoSesion(Map<String, Object> datos);
    void registrarSalidaSesion(Long idSesion);
}
