package org.uteq.sacpa.service.seguridad.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.seguridad.ProcesarSolicitudDTO;
import org.uteq.sacpa.dto.seguridad.SolicitudRegistroDTO;
import org.uteq.sacpa.entity.gerencia.Empleado;
import org.uteq.sacpa.entity.seguridad.Rol;
import org.uteq.sacpa.entity.seguridad.SolicitudRegistro;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.entity.seguridad.UsuarioRol;
import org.uteq.sacpa.repository.gerencia.IEmpleadoRepository;
import org.uteq.sacpa.repository.seguridad.IRolRepository;
import org.uteq.sacpa.repository.seguridad.ISolicitudRegistroRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.seguridad.ISolicitudRegistroService;
import org.uteq.sacpa.util.PasswordGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.uteq.sacpa.service.notificacion.EmailService;

@Service
@RequiredArgsConstructor
public class SolicitudRegistroServiceImpl implements ISolicitudRegistroService {

    private final ISolicitudRegistroRepository solicitudRepository;
    private final IUsuarioRepository usuarioRepository;
    private final IEmpleadoRepository empleadoRepository;
    private final IRolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordGenerator passwordGenerator;

    @Override
    @Transactional
    public SolicitudRegistroDTO crearSolicitud(SolicitudRegistroDTO dto) {
        SolicitudRegistro entity = SolicitudRegistro.builder()
                .correo(dto.getCorreo())
                .nombres(dto.getNombres())
                .apellidos(dto.getApellidos())
                .cedula(dto.getCedula())
                .telefono(dto.getTelefono())
                .departamento(dto.getDepartamento())
                .cargo(dto.getCargo())
                .fechaSolicitud(LocalDateTime.now())
                .idEstado(1)
                .build();
        SolicitudRegistro saved = solicitudRepository.save(entity);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudRegistroDTO> listarPendientes() {
        return solicitudRepository.findByIdEstadoOrderByIdSolicitudDesc(1).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudRegistroDTO> listarTodas() {
        return solicitudRepository.findAllByOrderByIdSolicitudDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void procesarSolicitud(Integer idSolicitud, ProcesarSolicitudDTO dto) {
        SolicitudRegistro solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        if (Boolean.TRUE.equals(dto.getAprobar())) {
            solicitud.setIdEstado(2); // APROBADA
            solicitud.setFechaProcesamiento(LocalDateTime.now());

            // Crear Usuario en BD con clave temporal segura
            String claveTemp = passwordGenerator.generate();
            Usuario usuario = Usuario.builder()
                    .correo(solicitud.getCorreo())
                    .contrasena(passwordEncoder != null ? passwordEncoder.encode(claveTemp) : claveTemp)
                    .idEstado(1)
                    .fechaCreacion(LocalDateTime.now())
                    .fechaActualizacion(LocalDateTime.now())
                    .roles(new ArrayList<>())
                    .build();

            Usuario savedUsuario = usuarioRepository.save(usuario);

            // Asignar roles elegidos por el admin
            if (dto.getIdRoles() != null) {
                for (Integer idRol : dto.getIdRoles()) {
                    Rol rol = rolRepository.findById(idRol).orElse(null);
                    if (rol != null) {
                        UsuarioRol ur = UsuarioRol.builder()
                                .usuario(savedUsuario)
                                .rol(rol)
                                .build();
                        savedUsuario.getRoles().add(ur);
                    }
                }
                usuarioRepository.save(savedUsuario);
            }

            // Crear registro de Empleado
            Empleado empleado = Empleado.builder()
                    .cedula(solicitud.getCedula())
                    .nombres(solicitud.getNombres())
                    .apellidos(solicitud.getApellidos())
                    .telefono(solicitud.getTelefono())
                    .departamento(solicitud.getDepartamento())
                    .cargo(solicitud.getCargo())
                    .fechaIngreso(LocalDate.now())
                    .activo(true)
                    .build();
            empleadoRepository.save(empleado);

            // Envío real de correo electrónico con contraseña temporal
            emailService.enviarCredencialesUsuario(solicitud.getCorreo(), claveTemp);

        } else {
            solicitud.setIdEstado(3); // RECHAZADA
            solicitud.setMotivoRechazo(dto.getMotivoRechazo());
            solicitud.setFechaProcesamiento(LocalDateTime.now());
        }
        solicitudRepository.save(solicitud);
    }

    private SolicitudRegistroDTO mapToDTO(SolicitudRegistro entity) {
        return SolicitudRegistroDTO.builder()
                .idSolicitud(entity.getIdSolicitud())
                .correo(entity.getCorreo())
                .nombres(entity.getNombres())
                .apellidos(entity.getApellidos())
                .cedula(entity.getCedula())
                .telefono(entity.getTelefono())
                .departamento(entity.getDepartamento())
                .cargo(entity.getCargo())
                .fechaSolicitud(entity.getFechaSolicitud())
                .idEstado(entity.getIdEstado())
                .motivoRechazo(entity.getMotivoRechazo())
                .build();
    }
}
