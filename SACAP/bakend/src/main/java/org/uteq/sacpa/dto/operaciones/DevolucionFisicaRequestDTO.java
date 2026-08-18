package org.uteq.sacpa.dto.operaciones;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevolucionFisicaRequestDTO {
    
    @NotBlank(message = "El estado de inventario es obligatorio")
    private String estadoInventario;
    
    private Integer idLoteDestino;
    private Integer idUbicacionDestino;
}
