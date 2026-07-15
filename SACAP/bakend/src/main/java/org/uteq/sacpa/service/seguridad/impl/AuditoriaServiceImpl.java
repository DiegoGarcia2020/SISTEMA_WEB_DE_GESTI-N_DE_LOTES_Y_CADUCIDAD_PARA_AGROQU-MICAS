package org.uteq.sacpa.service.seguridad.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.seguridad.Auditoria;
import org.uteq.sacpa.entity.seguridad.HistorialSesion;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.seguridad.IAuditoriaRepository;
import org.uteq.sacpa.repository.seguridad.IHistorialSesionRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.seguridad.IAuditoriaService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements IAuditoriaService {

    private final IAuditoriaRepository auditoriaRepository;
    private final IHistorialSesionRepository historialSesionRepository;
    private final IUsuarioRepository usuarioRepository;

    @Override
    public List<Auditoria> listarAuditoria() {
        return auditoriaRepository.findAll();
    }

    @Override
    @Transactional
    public Auditoria registrarAuditoria(Map<String, Object> datos) {
        String tabla = (String) datos.get("tablaAfectada");
        String operacion = (String) datos.get("operacion");
        String descripcion = (String) datos.get("descripcion");
        Integer idUsuario = datos.get("idUsuario") != null ? ((Number) datos.get("idUsuario")).intValue() : null;

        Usuario usuario = null;
        if (idUsuario != null) {
            usuario = usuarioRepository.findById(idUsuario).orElse(null);
        }

        Auditoria aud = Auditoria.builder()
                .tablaAfectada(tabla)
                .operacion(operacion)
                .descripcion(descripcion)
                .fechaHora(LocalDateTime.now())
                .usuario(usuario)
                .build();
        return auditoriaRepository.save(aud);
    }

    @Override
    public List<HistorialSesion> listarHistorialSesiones() {
        return historialSesionRepository.findAll();
    }

    @Override
    public List<HistorialSesion> listarSesionesPorUsuario(Integer idUsuario) {
        return historialSesionRepository.findAll().stream()
                .filter(s -> s.getUsuario() != null && s.getUsuario().getIdUsuario().equals(idUsuario))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void registrarIngresoSesion(Map<String, Object> datos) {
        String ip = (String) datos.get("ipAcceso");
        String rol = (String) datos.get("rolUtilizado");
        Integer idUsuario = datos.get("idUsuario") != null ? ((Number) datos.get("idUsuario")).intValue() : null;

        Usuario usuario = null;
        if (idUsuario != null) {
            usuario = usuarioRepository.findById(idUsuario).orElse(null);
        }

        HistorialSesion sesion = HistorialSesion.builder()
                .ipAcceso(ip)
                .rolUtilizado(rol)
                .fechaIngreso(LocalDateTime.now())
                .usuario(usuario)
                .build();
        historialSesionRepository.save(sesion);
    }

    @Override
    @Transactional
    public void registrarSalidaSesion(Long idSesion) {
        HistorialSesion sesion = historialSesionRepository.findById(idSesion.intValue()).orElse(null);
        if (sesion != null) {
            sesion.setFechaSalida(LocalDateTime.now());
            historialSesionRepository.save(sesion);
        }
    }
}
