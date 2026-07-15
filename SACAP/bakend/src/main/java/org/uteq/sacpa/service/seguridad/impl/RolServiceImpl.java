package org.uteq.sacpa.service.seguridad.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.seguridad.Rol;
import org.uteq.sacpa.entity.seguridad.RolBD;
import org.uteq.sacpa.repository.seguridad.IRolBDRepository;
import org.uteq.sacpa.repository.seguridad.IRolRepository;
import org.uteq.sacpa.service.seguridad.IRolService;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RolServiceImpl implements IRolService {

    private final IRolRepository rolRepository;
    private final IRolBDRepository rolBDRepository;

    @Override
    public List<Rol> listarRoles() {
        return rolRepository.findAll();
    }

    @Override
    public Rol obtenerRolPorId(Integer id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
    }

    @Override
    @Transactional
    public Rol crearRol(Map<String, Object> datos) {
        String nombre = (String) datos.get("nombre");
        Integer idEstado = datos.get("idEstado") != null ? ((Number) datos.get("idEstado")).intValue() : 1;
        Integer idRolBd = datos.get("idRolBd") != null ? ((Number) datos.get("idRolBd")).intValue() : null;

        RolBD rolBD = null;
        if (idRolBd != null) {
            rolBD = rolBDRepository.findById(idRolBd).orElse(null);
        }

        Rol rol = Rol.builder()
                .nombre(nombre)
                .idEstado(idEstado)
                .rolBD(rolBD)
                .build();
        return rolRepository.save(rol);
    }

    @Override
    @Transactional
    public Rol actualizarRol(Integer id, Map<String, Object> datos) {
        Rol rol = obtenerRolPorId(id);
        if (datos.containsKey("nombre")) {
            rol.setNombre((String) datos.get("nombre"));
        }
        if (datos.containsKey("idEstado")) {
            rol.setIdEstado(((Number) datos.get("idEstado")).intValue());
        }
        if (datos.containsKey("idRolBd")) {
            Integer idRolBd = ((Number) datos.get("idRolBd")).intValue();
            RolBD rolBD = rolBDRepository.findById(idRolBd).orElse(null);
            rol.setRolBD(rolBD);
        }
        return rolRepository.save(rol);
    }

    @Override
    @Transactional
    public void cambiarEstadoRol(Integer id, Integer idEstado) {
        Rol rol = obtenerRolPorId(id);
        rol.setIdEstado(idEstado);
        rolRepository.save(rol);
    }

    @Override
    @Transactional
    public void eliminarRol(Integer id) {
        rolRepository.deleteById(id);
    }

    @Override
    public List<RolBD> listarRolesBd() {
        return rolBDRepository.findAll();
    }

    @Override
    @Transactional
    public RolBD crearRolBd(Map<String, Object> datos) {
        String nombreRolBd = (String) datos.get("nombreRolBd");
        String descripcion = (String) datos.get("descripcion");
        Boolean activo = datos.get("activo") != null ? (Boolean) datos.get("activo") : true;

        RolBD rolBD = RolBD.builder()
                .nombreRolBd(nombreRolBd)
                .descripcion(descripcion)
                .activo(activo)
                .build();
        return rolBDRepository.save(rolBD);
    }

    @Override
    @Transactional
    public RolBD actualizarRolBd(Integer id, Map<String, Object> datos) {
        RolBD rolBD = rolBDRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol BD no encontrado con ID: " + id));
        if (datos.containsKey("nombreRolBd")) {
            rolBD.setNombreRolBd((String) datos.get("nombreRolBd"));
        }
        if (datos.containsKey("descripcion")) {
            rolBD.setDescripcion((String) datos.get("descripcion"));
        }
        if (datos.containsKey("activo")) {
            rolBD.setActivo((Boolean) datos.get("activo"));
        }
        return rolBDRepository.save(rolBD);
    }

    @Override
    @Transactional
    public void cambiarEstadoRolBd(Integer id, Boolean activo) {
        RolBD rolBD = rolBDRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol BD no encontrado con ID: " + id));
        rolBD.setActivo(activo);
        rolBDRepository.save(rolBD);
    }
}
