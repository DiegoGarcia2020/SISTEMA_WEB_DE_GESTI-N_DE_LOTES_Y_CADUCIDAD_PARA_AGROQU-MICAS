package org.uteq.sacpa.dto.catalogos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    // Campos opcionales para catalogos especificos (ej. tipo de movimiento)
    private String naturaleza;
}
