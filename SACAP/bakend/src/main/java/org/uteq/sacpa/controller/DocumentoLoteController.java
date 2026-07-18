package org.uteq.sacpa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.uteq.sacpa.dto.inventario.DocumentoLoteResponseDTO;
import org.uteq.sacpa.service.inventario.IDocumentoLoteService;

import java.util.List;
import java.util.Map;

/**
 * Controlador de Documentos de Lote (PDFs).
 *
 * POST   /api/documentos-lote/{idLote}/upload  → sube PDF a Cloudinary
 * GET    /api/documentos-lote/{idLote}         → lista documentos del lote
 * DELETE /api/documentos-lote/{idDocumento}    → elimina un documento
 */
@RestController
@RequestMapping("/api/documentos-lote")
@RequiredArgsConstructor
public class DocumentoLoteController {

    private final IDocumentoLoteService documentoService;

    /**
     * Sube un archivo (PDF recomendado) asociado a un lote.
     * Usar multipart/form-data con campos: archivo (file), tipoDocumento (text).
     * Tipos sugeridos: GUIA_REMISION, FICHA_TECNICA, CERTIFICADO_CALIDAD, HOJA_SEGURIDAD
     */
    @PostMapping(value = "/{idLote}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoLoteResponseDTO> subirDocumento(
            @PathVariable Integer idLote,
            @RequestPart("archivo") MultipartFile archivo,
            @RequestParam(value = "tipoDocumento", defaultValue = "GUIA_REMISION") String tipoDocumento) {
        return ResponseEntity.status(201)
                .body(documentoService.subirDocumento(idLote, archivo, tipoDocumento));
    }

    @GetMapping("/{idLote}")
    public ResponseEntity<List<DocumentoLoteResponseDTO>> listarDocumentos(@PathVariable Integer idLote) {
        return ResponseEntity.ok(documentoService.listarPorLote(idLote));
    }

    @DeleteMapping("/{idDocumento}")
    public ResponseEntity<Map<String, String>> eliminarDocumento(@PathVariable Integer idDocumento) {
        documentoService.eliminarDocumento(idDocumento);
        return ResponseEntity.ok(Map.of("mensaje", "Documento eliminado exitosamente"));
    }
}
