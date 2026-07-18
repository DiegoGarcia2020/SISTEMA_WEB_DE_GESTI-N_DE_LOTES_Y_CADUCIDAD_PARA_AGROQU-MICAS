package org.uteq.sacpa.service.inventario;

import org.springframework.web.multipart.MultipartFile;
import org.uteq.sacpa.dto.inventario.DocumentoLoteResponseDTO;

import java.util.List;

public interface IDocumentoLoteService {
    /**
     * Sube un archivo PDF a Cloudinary (o lo guarda como placeholder si no hay credenciales)
     * y registra el documento en inventario.documentos_lote.
     */
    DocumentoLoteResponseDTO subirDocumento(Integer idLote, MultipartFile archivo, String tipoDocumento);

    /** Lista todos los documentos de un lote */
    List<DocumentoLoteResponseDTO> listarPorLote(Integer idLote);

    /** Elimina un documento de Cloudinary y de la BD */
    void eliminarDocumento(Integer idDocumento);
}
