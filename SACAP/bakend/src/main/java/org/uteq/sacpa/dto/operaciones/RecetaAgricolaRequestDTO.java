package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecetaAgricolaRequestDTO {

    @NotBlank(message = "El número de autorización/registro de la receta es obligatorio")
    private String numeroAutorizacion;

    @NotNull(message = "El cliente es obligatorio")
    private Integer idCliente;

    @NotNull(message = "El producto es obligatorio")
    private Integer idProducto;

    @NotBlank(message = "El nombre del profesional que firma la receta es obligatorio")
    private String nombreProfesional;

    private String registroProfesional;

    private String documentoUrl;

    @NotNull(message = "La fecha de emisión es obligatoria")
    @PastOrPresent(message = "La fecha de emisión no puede ser futura")
    private LocalDate fechaEmision;
}
