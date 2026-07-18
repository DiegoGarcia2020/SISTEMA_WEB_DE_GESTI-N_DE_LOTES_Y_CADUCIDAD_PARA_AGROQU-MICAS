package org.uteq.sacpa.service.inventario.impl;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.uteq.sacpa.dto.inventario.DocumentoLoteResponseDTO;
import org.uteq.sacpa.entity.inventario.DocumentoLote;
import org.uteq.sacpa.repository.inventario.IDocumentoLoteRepository;
import org.uteq.sacpa.service.inventario.IDocumentoLoteService;

import java.util.List;
import java.util.Map;

/**
 * Sube PDFs a Cloudinary y guarda la URL en inventario.documentos_lote.
 *
 * Modo FALLBACK: si Cloudinary no tiene credenciales reales (cloud_name="your_cloud_name"),
 * guarda una URL placeholder y loguea una advertencia.
 * El sistema sigue funcional para desarrollo.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentoLoteServiceImpl implements IDocumentoLoteService {

    private final Cloudinary             cloudinary;
    private final IDocumentoLoteRepository documentoRepo;

    private static final String PLACEHOLDER_PREFIX = "PENDIENTE_CLOUDINARY://";

    @Override
    public DocumentoLoteResponseDTO subirDocumento(Integer idLote, MultipartFile archivo, String tipoDocumento) {
        String urlFinal = subirACloudinary(archivo, idLote);

        documentoRepo.crearDocumento(
                archivo.getOriginalFilename(),
                urlFinal,
                tipoDocumento,
                idLote
        );

        // Recuperar el documento recién guardado
        List<DocumentoLote> docs = documentoRepo.findByLote_IdLote(idLote);
        DocumentoLote ultimo = docs.get(docs.size() - 1);
        return DocumentoLoteResponseDTO.from(ultimo);
    }

    @Override
    public List<DocumentoLoteResponseDTO> listarPorLote(Integer idLote) {
        return documentoRepo.findByLote_IdLote(idLote)
                .stream()
                .map(DocumentoLoteResponseDTO::from)
                .toList();
    }

    @Override
    public void eliminarDocumento(Integer idDocumento) {
        documentoRepo.eliminarDocumento(idDocumento);
    }

    // ─────────────────────────────────────────────
    // Lógica de subida a Cloudinary con fallback
    // ─────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private String subirACloudinary(MultipartFile archivo, Integer idLote) {
        try {
            // Verificar si las credenciales son placeholder
            Object configObj = cloudinary.config.cloudName;
            if (configObj == null || configObj.toString().contains("your_cloud")) {
                log.warn("⚠️ Cloudinary no configurado. Guardando URL placeholder para lote {}.", idLote);
                return PLACEHOLDER_PREFIX + archivo.getOriginalFilename();
            }

            Map<String, Object> params = Map.of(
                    "folder",        "sacpa/lotes/" + idLote,
                    "resource_type", "raw",          // PDFs van como raw
                    "format",        "pdf",
                    "public_id",     "lote_" + idLote + "_" + System.currentTimeMillis()
            );

            Map<String, Object> result = cloudinary.uploader().upload(archivo.getBytes(), params);
            return (String) result.get("secure_url");

        } catch (Exception e) {
            log.error("Error al subir a Cloudinary: {}. Usando placeholder.", e.getMessage());
            return PLACEHOLDER_PREFIX + archivo.getOriginalFilename();
        }
    }
}
