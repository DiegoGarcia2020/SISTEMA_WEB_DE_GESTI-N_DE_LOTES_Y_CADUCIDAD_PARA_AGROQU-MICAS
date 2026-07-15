package org.uteq.sacpa.service.gerencia.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.gerencia.Administrador;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.gerencia.IAdministradorRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.gerencia.IAdministradorService;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdministradorServiceImpl implements IAdministradorService {

    private final IAdministradorRepository administradorRepository;
    private final IUsuarioRepository usuarioRepository;

    @Override
    public Administrador obtenerPorIdUsuario(Integer idUsuario) {
        return administradorRepository.findByUsuario_IdUsuario(idUsuario)
                .orElseGet(() -> {
                    Usuario usr = usuarioRepository.findById(idUsuario).orElse(null);
                    if (usr == null) {
                        usr = Usuario.builder().idUsuario(idUsuario).correo("admin@sacpa.ec").build();
                        try {
                            usr = usuarioRepository.save(usr);
                        } catch (Exception e) {
                            // Si falla por algún constraint, intentamos buscar el primer usuario existente o dejar sin guardar
                            usr = usuarioRepository.findAll().stream().findFirst().orElse(usr);
                        }
                    }
                    Administrador nuevo = Administrador.builder()
                            .usuario(usr)
                            .nombres("Administrador")
                            .apellidos("SACPA")
                            .cedula("1700000000")
                            .telefono("0999999999")
                            .build();
                    return administradorRepository.save(nuevo);
                });
    }

    @Override
    @Transactional
    public Administrador actualizarPerfil(Integer idUsuario, Map<String, Object> datos) {
        Administrador admin = obtenerPorIdUsuario(idUsuario);
        if (datos.containsKey("nombres")) admin.setNombres((String) datos.get("nombres"));
        if (datos.containsKey("apellidos")) admin.setApellidos((String) datos.get("apellidos"));
        if (datos.containsKey("cedula")) admin.setCedula((String) datos.get("cedula"));
        if (datos.containsKey("telefono")) admin.setTelefono((String) datos.get("telefono"));
        if (datos.containsKey("fotoPerfil")) admin.setFotoPerfil((String) datos.get("fotoPerfil"));
        return administradorRepository.save(admin);
    }

    @Override
    @Transactional
    public void actualizarFotoPerfil(Integer idUsuario, String fotoBase64OUrl) {
        Administrador admin = obtenerPorIdUsuario(idUsuario);
        admin.setFotoPerfil(fotoBase64OUrl);
        administradorRepository.save(admin);
    }
}
