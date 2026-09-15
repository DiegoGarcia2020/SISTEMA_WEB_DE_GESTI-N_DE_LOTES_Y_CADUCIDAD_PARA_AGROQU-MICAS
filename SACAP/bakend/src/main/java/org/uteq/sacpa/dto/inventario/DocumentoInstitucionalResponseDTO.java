package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.DocumentoInstitucional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentoInstitucionalResponseDTO {
    private Integer idDocumento;
    private Integer idAlmacen;
    private String nombreAlmacen;
    private String tipoDocumento;
    private String nombreArchivo;
    private String rutaArchivo;
    private LocalDate fechaEmision;
    private LocalDate fechaVencimiento;
    private boolean vencido;
    private String nombreUsuarioSubida;
    private LocalDateTime fechaSubida;

    public static DocumentoInstitucionalResponseDTO from(DocumentoInstitucional d) {
        return DocumentoInstitucionalResponseDTO.builder()
                .idDocumento(d.getIdDocumento())
                .idAlmacen(d.getAlmacen() != null ? d.getAlmacen().getIdAlmacen() : null)
                .nombreAlmacen(d.getAlmacen() != null ? d.getAlmacen().getNombre() : "Empresa (general)")
                .tipoDocumento(d.getTipoDocumento())
                .nombreArchivo(d.getNombreArchivo())
                .rutaArchivo(d.getRutaArchivo())
                .fechaEmision(d.getFechaEmision())
                .fechaVencimiento(d.getFechaVencimiento())
                .vencido(d.getFechaVencimiento() != null && d.getFechaVencimiento().isBefore(LocalDate.now()))
                .nombreUsuarioSubida(d.getUsuarioSubida() != null ? d.getUsuarioSubida().getCorreo() : null)
                .fechaSubida(d.getFechaSubida())
                .build();
    }
}
