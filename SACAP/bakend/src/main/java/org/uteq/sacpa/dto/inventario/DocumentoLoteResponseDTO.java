package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.inventario.DocumentoLote;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentoLoteResponseDTO {
    private Integer       idDocumento;
    private String        nombreArchivo;
    private String        rutaArchivo;  // URL pública de Cloudinary (o placeholder)
    private String        tipoDocumento;
    private LocalDateTime fechaSubida;
    private Integer       idLote;

    public static DocumentoLoteResponseDTO from(DocumentoLote d) {
        return DocumentoLoteResponseDTO.builder()
                .idDocumento(d.getIdDocumento())
                .nombreArchivo(d.getNombreArchivo())
                .rutaArchivo(d.getRutaArchivo())
                .tipoDocumento(d.getTipoDocumento())
                .fechaSubida(d.getFechaSubida())
                .idLote(d.getLote() != null ? d.getLote().getIdLote() : null)
                .build();
    }
}
