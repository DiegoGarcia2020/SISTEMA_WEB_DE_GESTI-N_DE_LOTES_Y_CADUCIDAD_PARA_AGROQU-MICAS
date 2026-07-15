package org.uteq.sacpa.service.seguridad.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.seguridad.UsuarioRequestDTO;
import org.uteq.sacpa.dto.seguridad.UsuarioResponseDTO;
import org.uteq.sacpa.entity.seguridad.Rol;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.entity.seguridad.UsuarioRol;
import org.uteq.sacpa.repository.seguridad.IRolRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.seguridad.IUsuarioService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.uteq.sacpa.service.notificacion.EmailService;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements IUsuarioService {

    private final IUsuarioRepository usuarioRepository;
    private final IRolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        return mapToDTO(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO crear(UsuarioRequestDTO request) {
        if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario registrado con el correo: " + request.getCorreo());
        }
        if (request.getContrasena() == null || request.getContrasena().trim().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria para crear un nuevo usuario");
        }

        Usuario usuario = Usuario.builder()
                .correo(request.getCorreo())
                .contrasena(passwordEncoder.encode(request.getContrasena()))
                .idEstado(request.getIdEstado())
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .roles(new ArrayList<>())
                .build();

        if (request.getIdRoles() != null) {
            for (Integer idRol : request.getIdRoles()) {
                Rol rol = rolRepository.findById(idRol)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + idRol));
                UsuarioRol usuarioRol = UsuarioRol.builder()
                        .usuario(usuario)
                        .rol(rol)
                        .build();
                usuario.getRoles().add(usuarioRol);
            }
        }

        Usuario guardado = usuarioRepository.save(usuario);
        emailService.enviarCredencialesUsuario(request.getCorreo(), request.getContrasena());
        return mapToDTO(guardado);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO actualizar(Integer id, UsuarioRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        // Validar si el correo cambió y no esté repetido
        if (!usuario.getCorreo().equalsIgnoreCase(request.getCorreo())) {
            if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
                throw new RuntimeException("Ya existe otro usuario con el correo: " + request.getCorreo());
            }
            usuario.setCorreo(request.getCorreo());
        }

        if (request.getContrasena() != null && !request.getContrasena().trim().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        }

        usuario.setIdEstado(request.getIdEstado());
        usuario.setFechaActualizacion(LocalDateTime.now());

        // Actualizar roles
        usuario.getRoles().clear();
        if (request.getIdRoles() != null) {
            for (Integer idRol : request.getIdRoles()) {
                Rol rol = rolRepository.findById(idRol)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + idRol));
                UsuarioRol usuarioRol = UsuarioRol.builder()
                        .usuario(usuario)
                        .rol(rol)
                        .build();
                usuario.getRoles().add(usuarioRol);
            }
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        return mapToDTO(actualizado);
    }

    @Override
    @Transactional
    public void cambiarEstado(Integer id, Integer idEstado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        usuario.setIdEstado(idEstado);
        usuario.setFechaActualizacion(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private UsuarioResponseDTO mapToDTO(Usuario u) {
        List<String> nombresRoles = new ArrayList<>();
        List<Integer> idsRoles = new ArrayList<>();
        if (u.getRoles() != null) {
            for (UsuarioRol ur : u.getRoles()) {
                if (ur.getRol() != null) {
                    nombresRoles.add(ur.getRol().getNombre());
                    idsRoles.add(ur.getRol().getIdRol());
                }
            }
        }
        return UsuarioResponseDTO.builder()
                .idUsuario(u.getIdUsuario())
                .correo(u.getCorreo())
                .idEstado(u.getIdEstado())
                .fechaCreacion(u.getFechaCreacion())
                .fechaActualizacion(u.getFechaActualizacion())
                .roles(nombresRoles)
                .idRoles(idsRoles)
                .build();
    }
}
