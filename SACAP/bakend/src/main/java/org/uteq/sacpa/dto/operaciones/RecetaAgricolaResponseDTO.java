package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.RecetaAgricola;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecetaAgricolaResponseDTO {

    private Integer idReceta;
    private String numeroAutorizacion;
    private Integer idCliente;
    private String nombreFinca;
    private Integer idProducto;
    private String nombreProducto;
    private String nombreProfesional;
    private String registroProfesional;
    private String documentoUrl;
    private LocalDate fechaEmision;
    private Boolean usada;
    private LocalDateTime fechaUso;

    public static RecetaAgricolaResponseDTO from(RecetaAgricola r) {
        return RecetaAgricolaResponseDTO.builder()
                .idReceta(r.getIdReceta())
                .numeroAutorizacion(r.getNumeroAutorizacion())
                .idCliente(r.getCliente().getIdCliente())
                .nombreFinca(r.getCliente().getNombreFinca())
                .idProducto(r.getProducto().getIdProducto())
                .nombreProducto(r.getProducto().getNombre())
                .nombreProfesional(r.getNombreProfesional())
                .registroProfesional(r.getRegistroProfesional())
                .documentoUrl(r.getDocumentoUrl())
                .fechaEmision(r.getFechaEmision())
                .usada(r.getUsada())
                .fechaUso(r.getFechaUso())
                .build();
    }
}
