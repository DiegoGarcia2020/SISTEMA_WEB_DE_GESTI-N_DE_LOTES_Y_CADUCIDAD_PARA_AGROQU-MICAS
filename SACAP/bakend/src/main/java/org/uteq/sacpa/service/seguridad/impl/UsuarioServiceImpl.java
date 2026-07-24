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
    private final org.uteq.sacpa.repository.operaciones.ITecnicoCampoRepository tecnicoCampoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        try {
            return usuarioRepository.findAllWithRoles().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            try {
                return usuarioRepository.findAll().stream()
                        .map(this::mapToDTO)
                        .collect(Collectors.toList());
            } catch (Exception ex) {
                return new ArrayList<>();
            }
        }
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
    public UsuarioResponseDTO crearBasico(org.uteq.sacpa.dto.seguridad.CrearUsuarioBasicoRequestDTO request) {
        if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario registrado con el correo: " + request.getCorreo());
        }

        String contrasenaTemporal = java.util.UUID.randomUUID().toString().substring(0, 10).toUpperCase() + "!.";

        Usuario usuario = Usuario.builder()
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .cedula(request.getCedula())
                .correo(request.getCorreo())
                .telefono(request.getTelefono())
                .ocupacion(request.getOcupacion())
                .contrasena(passwordEncoder.encode(contrasenaTemporal))
                .idEstado(2) // 2: Inactivo/Sin Rol hasta que se le asigne rol
                .requiereCambioClave(true)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .roles(new ArrayList<>())
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        emailService.enviarCredencialesUsuario(request.getCorreo(), contrasenaTemporal);
        return mapToDTO(guardado);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO asignarRol(Integer idUsuario, Integer idRol, org.springframework.web.multipart.MultipartFile documento) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));

        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + idRol));

        boolean esRolTecnicoCampo = rol.getNombre() != null && 
                (rol.getNombre().toLowerCase().contains("campo") || rol.getNombre().toLowerCase().contains("técnico") || rol.getNombre().toLowerCase().contains("tecnico") || rol.getNombre().toLowerCase().contains("agrícola") || rol.getNombre().toLowerCase().contains("agricola"));

        if (esRolTecnicoCampo) {
            org.uteq.sacpa.entity.operaciones.TecnicoCampo tecnico = tecnicoCampoRepository.findByUsuario_IdUsuario(idUsuario).orElse(null);
            if (tecnico != null && tecnico.getDocumentoPdf() != null && tecnico.getDocumentoPdf().length > 0) {
                // Ya tiene documento en BD, no requiere subir uno nuevo
            } else {
                if (documento == null || documento.isEmpty()) {
                    throw new RuntimeException("El rol de Técnico de Campo requiere subir obligatoriamente el documento PDF de licencia en formato binario.");
                }
                try {
                    byte[] bytes = documento.getBytes();
                    if (tecnico == null) {
                        tecnico = org.uteq.sacpa.entity.operaciones.TecnicoCampo.builder()
                                .cedula(usuario.getCedula() != null ? usuario.getCedula() : "CED-" + idUsuario)
                                .nombres(usuario.getNombres() != null ? usuario.getNombres() : "Técnico")
                                .apellidos(usuario.getApellidos() != null ? usuario.getApellidos() : "SACPA")
                                .telefono(usuario.getTelefono())
                                .licenciaAgricola("LIC-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .idEstado(1)
                                .usuario(usuario)
                                .documentoPdf(bytes)
                                .build();
                    } else {
                        tecnico.setDocumentoPdf(bytes);
                    }
                    tecnicoCampoRepository.save(tecnico);
                } catch (java.io.IOException e) {
                    throw new RuntimeException("Error al procesar y guardar el archivo PDF del documento", e);
                }
            }
        }

        if (usuario.getRoles() == null) {
            usuario.setRoles(new ArrayList<>());
        } else {
            usuario.getRoles().clear();
        }

        UsuarioRol usuarioRol = UsuarioRol.builder()
                .usuario(usuario)
                .rol(rol)
                .build();
        usuario.getRoles().add(usuarioRol);
        usuario.setIdEstado(1); // 1: Activo al ya contar con rol
        usuario.setFechaActualizacion(LocalDateTime.now());

        Usuario actualizado = usuarioRepository.save(usuario);
        return mapToDTO(actualizado);
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
                .requiereCambioClave(true)
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

    @Override
    @Transactional
    public UsuarioResponseDTO resetPassword(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        String contrasenaTemporal = "Sacpa" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase() + "!.";
        usuario.setContrasena(passwordEncoder.encode(contrasenaTemporal));
        usuario.setRequiereCambioClave(true);
        usuario.setFechaActualizacion(LocalDateTime.now());
        Usuario guardado = usuarioRepository.save(usuario);
        emailService.enviarCredencialesUsuario(usuario.getCorreo(), contrasenaTemporal);
        return mapToDTO(guardado);
    }

    private UsuarioResponseDTO mapToDTO(Usuario u) {
        List<String> nombresRoles = new ArrayList<>();
        List<Integer> idsRoles = new ArrayList<>();
        try {
            if (u.getRoles() != null) {
                for (UsuarioRol ur : u.getRoles()) {
                    if (ur.getRol() != null) {
                        nombresRoles.add(ur.getRol().getNombre());
                        idsRoles.add(ur.getRol().getIdRol());
                    }
                }
            }
        } catch (Exception e) {
            // Tolerancia a fallos si la consulta a usuario_rol no coincide o no hay sesión activa
        }
        boolean tienePdf = false;
        try {
            org.uteq.sacpa.entity.operaciones.TecnicoCampo tec = tecnicoCampoRepository.findByUsuario_IdUsuario(u.getIdUsuario()).orElse(null);
            if (tec != null && tec.getDocumentoPdf() != null && tec.getDocumentoPdf().length > 0) {
                tienePdf = true;
            }
        } catch (Exception e) {
            // Tolerancia a fallos si la tabla tecnico_campo no coincide con la BD real
        }
        return UsuarioResponseDTO.builder()
                .idUsuario(u.getIdUsuario())
                .correo(u.getCorreo())
                .idEstado(u.getIdEstado())
                .requiereCambioClave(u.getRequiereCambioClave() != null && u.getRequiereCambioClave())
                .fechaCreacion(u.getFechaCreacion())
                .fechaActualizacion(u.getFechaActualizacion())
                .nombres(u.getNombres())
                .apellidos(u.getApellidos())
                .cedula(u.getCedula())
                .telefono(u.getTelefono())
                .ocupacion(u.getOcupacion())
                .tieneDocumentoPdf(tienePdf)
                .roles(nombresRoles)
                .idRoles(idsRoles)
                .build();
    }
}
