package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.Supervisor;

/** Opción de selector para que el Administrador asigne un Supervisor a una bodega. */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SupervisorOpcionDTO {
    private Integer idSupervisor;
    private String  nombreCompleto;
    private String  correo;

    public static SupervisorOpcionDTO from(Supervisor s) {
        return SupervisorOpcionDTO.builder()
                .idSupervisor(s.getIdSupervisor())
                .nombreCompleto((s.getNombres() != null ? s.getNombres() : "") + " " + (s.getApellidos() != null ? s.getApellidos() : ""))
                .correo(s.getUsuario() != null ? s.getUsuario().getCorreo() : null)
                .build();
    }
}
