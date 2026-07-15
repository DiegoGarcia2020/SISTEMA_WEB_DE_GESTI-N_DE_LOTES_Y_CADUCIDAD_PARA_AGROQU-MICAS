package org.uteq.sacpa.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSelectionRequestDTO {
    @NotBlank(message = "El rol seleccionado es obligatorio")
    private String rolSeleccionado;
}
