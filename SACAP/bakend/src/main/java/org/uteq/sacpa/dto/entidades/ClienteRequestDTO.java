package org.uteq.sacpa.dto.entidades;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteRequestDTO {

    @NotBlank(message = "El nombre de la finca es obligatorio")
    private String nombreFinca;

    @NotBlank(message = "La cédula es obligatoria")
    @Size(min = 10, max = 13, message = "La cédula debe tener entre 10 y 13 caracteres")
    private String cedula;

    private String telefono;
    private String direccion;

    @NotNull(message = "El ID del técnico asignado es obligatorio")
    private Integer idTecnico;
}
