package org.uteq.sacpa.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    // FASE 1: Se envia solo token PRE_AUTH y los roles disponibles para elegir
    // FASE 2: Se envia token FINAL y null en roles (ya fue elegido)
    private String token;
    private String tipoFase; // "PRE_AUTH" o "FINAL"
    private List<String> rolesDisponibles;
    private UsuarioInfoDTO usuario;
}
