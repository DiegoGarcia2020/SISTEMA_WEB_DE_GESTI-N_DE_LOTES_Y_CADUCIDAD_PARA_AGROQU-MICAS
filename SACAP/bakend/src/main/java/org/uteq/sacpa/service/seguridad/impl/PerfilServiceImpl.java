package org.uteq.sacpa.service.seguridad.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.auth.CambioContrasenaRequestDTO;
import org.uteq.sacpa.dto.seguridad.ActualizarPerfilRequestDTO;
import org.uteq.sacpa.dto.seguridad.MiPerfilResponseDTO;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.exception.BadRequestException;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.service.seguridad.IPerfilService;

@Service
@RequiredArgsConstructor
public class PerfilServiceImpl implements IPerfilService {

    private final IUsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public MiPerfilResponseDTO obtenerMiPerfil(Integer idUsuario) {
        return toDto(buscarUsuario(idUsuario));
    }

    @Override
    @Transactional
    public MiPerfilResponseDTO actualizarMiPerfil(Integer idUsuario, ActualizarPerfilRequestDTO datos) {
        Usuario usuario = buscarUsuario(idUsuario);
        if (datos.getNombres() != null) usuario.setNombres(datos.getNombres());
        if (datos.getApellidos() != null) usuario.setApellidos(datos.getApellidos());
        if (datos.getTelefono() != null) usuario.setTelefono(datos.getTelefono());
        if (datos.getOcupacion() != null) usuario.setOcupacion(datos.getOcupacion());
        return toDto(usuarioRepository.save(usuario));
    }

    /** data:image/(jpeg|png|webp|gif);base64,... -- tope ~3MB de texto (~2.2MB de imagen real). */
    private static final java.util.regex.Pattern FOTO_DATA_URI =
            java.util.regex.Pattern.compile("^data:image/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$");
    private static final int FOTO_MAX_CHARS = 3_000_000;

    @Override
    @Transactional
    public MiPerfilResponseDTO actualizarMiFoto(Integer idUsuario, String fotoBase64OUrl) {
        Usuario usuario = buscarUsuario(idUsuario);
        if (fotoBase64OUrl == null || fotoBase64OUrl.isBlank()) {
            usuario.setFotoPerfil(null);
        } else {
            if (fotoBase64OUrl.length() > FOTO_MAX_CHARS) {
                throw new BadRequestException("La foto de perfil es demasiado grande (máximo ~2MB).");
            }
            if (!FOTO_DATA_URI.matcher(fotoBase64OUrl).matches()) {
                throw new BadRequestException("Formato de foto de perfil inválido. Debe ser una imagen JPG, PNG, WEBP o GIF.");
            }
            usuario.setFotoPerfil(fotoBase64OUrl);
        }
        return toDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public void cambiarMiContrasena(Integer idUsuario, CambioContrasenaRequestDTO request) {
        Usuario usuario = buscarUsuario(idUsuario);
        if (request.getContrasenaActual() == null || request.getContrasenaActual().isBlank()
                || !passwordEncoder.matches(request.getContrasenaActual(), usuario.getContrasena())) {
            throw new BadRequestException("La contraseña actual ingresada es incorrecta");
        }
        String hash = passwordEncoder.encode(request.getNuevaContrasena());
        usuarioRepository.actualizarContrasenaYEstado(idUsuario, hash, false);
    }

    private Usuario buscarUsuario(Integer idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + idUsuario));
    }

    private MiPerfilResponseDTO toDto(Usuario usuario) {
        return MiPerfilResponseDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .correo(usuario.getCorreo())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .telefono(usuario.getTelefono())
                .ocupacion(usuario.getOcupacion())
                .fotoPerfil(usuario.getFotoPerfil())
                .roles(usuario.getRoles() == null ? java.util.List.of() :
                        usuario.getRoles().stream().map(ur -> ur.getRol().getNombre()).toList())
                .build();
    }
}
