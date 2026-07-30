package org.uteq.sacpa.dto.entidades;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorRequestDTO {

    @Email(message = "Debe ser un correo valido")
    private String correoContacto;

    @NotBlank(message = "El RUC es obligatorio")
    private String ruc;

    @NotBlank(message = "El nombre del representante es obligatorio")
    private String nombreRepresentante;

    @NotBlank(message = "La direccion es obligatoria")
    private String direccion;

    private String telefonoEmpresa;

    @NotNull(message = "El ID de la empresa es obligatorio")
    private Integer idEmpresa;

    @NotNull(message = "El ID de la ciudad es obligatorio")
    private Integer idCiudad;

    @NotNull(message = "El ID del estado es obligatorio")
    private Integer idEstado;
}
