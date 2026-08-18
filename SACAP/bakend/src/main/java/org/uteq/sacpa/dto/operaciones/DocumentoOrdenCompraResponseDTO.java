package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.DocumentoOrdenCompra;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoOrdenCompraResponseDTO {
    
    private Integer idDocumento;
    private Integer idOrdenCompra;
    private String nombreArchivo;
    private String urlArchivo;
    private String tipoDocumento;
    private LocalDateTime fechaSubida;
    private Integer idUsuarioSubida;

    public static DocumentoOrdenCompraResponseDTO from(DocumentoOrdenCompra doc) {
        if (doc == null) return null;
        return DocumentoOrdenCompraResponseDTO.builder()
                .idDocumento(doc.getIdDocumento())
                .idOrdenCompra(doc.getOrdenCompra() != null ? doc.getOrdenCompra().getId() : null)
                .nombreArchivo(doc.getNombreArchivo())
                .urlArchivo(doc.getUrlArchivo())
                .tipoDocumento(doc.getTipoDocumento())
                .fechaSubida(doc.getFechaSubida())
                .idUsuarioSubida(doc.getIdUsuarioSubida())
                .build();
    }
}
