package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.RegistroTemperatura;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroTemperaturaResponseDTO {

    private Integer idRegistro;
    private Integer idZona;
    private String nombreZona;
    private BigDecimal temperatura;
    private BigDecimal humedadRelativa;
    private Boolean fueraDeRango;
    private String observaciones;
    private String nombreUsuarioRegistro;
    private LocalDateTime fechaHora;

    public static RegistroTemperaturaResponseDTO from(RegistroTemperatura r) {
        return RegistroTemperaturaResponseDTO.builder()
                .idRegistro(r.getIdRegistro())
                .idZona(r.getZona().getIdZona())
                .nombreZona(r.getZona().getNombre())
                .temperatura(r.getTemperatura())
                .humedadRelativa(r.getHumedadRelativa())
                .fueraDeRango(r.getFueraDeRango())
                .observaciones(r.getObservaciones())
                .nombreUsuarioRegistro(r.getUsuarioRegistro() != null ? r.getUsuarioRegistro().getCorreo() : null)
                .fechaHora(r.getFechaHora())
                .build();
    }
}
