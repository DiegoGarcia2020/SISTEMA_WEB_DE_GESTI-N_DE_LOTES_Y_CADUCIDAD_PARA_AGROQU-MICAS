package org.uteq.sacpa.service.gerencia;

import org.uteq.sacpa.entity.gerencia.Administrador;

import java.util.Map;

public interface IAdministradorService {
    Administrador obtenerPorIdUsuario(Integer idUsuario);
    Administrador actualizarPerfil(Integer idUsuario, Map<String, Object> datos);
    void actualizarFotoPerfil(Integer idUsuario, String fotoBase64OUrl);
}
