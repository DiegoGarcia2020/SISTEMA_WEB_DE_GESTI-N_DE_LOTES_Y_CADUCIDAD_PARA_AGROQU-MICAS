package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsoCampoRequestDTO {

    @NotNull(message = "La fecha de uso es obligatoria")
    private LocalDate fechaUso;

    @NotNull(message = "La cantidad usada es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidadUsada;

    @NotBlank(message = "El cultivo o parcela es obligatorio")
    private String cultivoParcela;

    private String observaciones;

    @NotNull(message = "El ID del tecnico de campo es obligatorio")
    private Integer idTecnicoCampo;

    @NotNull(message = "El ID del lote es obligatorio")
    private Integer idLote;

    @NotNull(message = "El ID del estado es obligatorio")
    private Integer idEstado;
}
