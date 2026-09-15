package org.uteq.sacpa.service.seguridad;

import org.uteq.sacpa.dto.auth.CambioContrasenaRequestDTO;
import org.uteq.sacpa.dto.seguridad.ActualizarPerfilRequestDTO;
import org.uteq.sacpa.dto.seguridad.MiPerfilResponseDTO;

/**
 * Perfil propio del usuario autenticado (cualquier rol). Todas las operaciones
 * se acotan al idUsuario resuelto desde el JWT -- nunca a un id que mande el cliente --
 * para que nadie pueda leer o tocar el perfil de otra persona.
 */
public interface IPerfilService {
    MiPerfilResponseDTO obtenerMiPerfil(Integer idUsuario);
    MiPerfilResponseDTO actualizarMiPerfil(Integer idUsuario, ActualizarPerfilRequestDTO datos);
    MiPerfilResponseDTO actualizarMiFoto(Integer idUsuario, String fotoBase64OUrl);
    void cambiarMiContrasena(Integer idUsuario, CambioContrasenaRequestDTO request);
}
