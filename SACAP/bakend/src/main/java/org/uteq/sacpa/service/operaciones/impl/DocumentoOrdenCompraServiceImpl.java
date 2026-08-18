package org.uteq.sacpa.service.operaciones.impl;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.uteq.sacpa.dto.operaciones.DocumentoOrdenCompraResponseDTO;
import org.uteq.sacpa.entity.operaciones.DocumentoOrdenCompra;
import org.uteq.sacpa.entity.operaciones.OrdenCompra;
import org.uteq.sacpa.repository.operaciones.DocumentoOrdenCompraRepository;
import org.uteq.sacpa.repository.operaciones.IOrdenCompraRepository;
import org.uteq.sacpa.service.operaciones.IDocumentoOrdenCompraService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentoOrdenCompraServiceImpl implements IDocumentoOrdenCompraService {

    private final Cloudinary cloudinary;
    private final DocumentoOrdenCompraRepository documentoRepo;
    private final IOrdenCompraRepository ordenCompraRepo;
    private final org.uteq.sacpa.security.SecurityContextService securityContextService;

    private static final String PLACEHOLDER_PREFIX = "PENDIENTE_CLOUDINARY://";

    @Override
    public DocumentoOrdenCompraResponseDTO subirDocumento(Integer idOrdenCompra, MultipartFile archivo, String tipoDocumento) {
        OrdenCompra ordenCompra = ordenCompraRepo.findById(idOrdenCompra)
                .orElseThrow(() -> new RuntimeException("Orden de compra no encontrada: " + idOrdenCompra));

        // Validación de tipo de archivo (solo PDF, JPG, PNG)
        String contentType = archivo.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
                                    !contentType.equals("image/jpeg") && 
                                    !contentType.equals("image/png"))) {
            throw new RuntimeException("Tipo de archivo no permitido. Solo se aceptan PDF, JPG y PNG.");
        }

        String urlFinal = subirACloudinary(archivo, idOrdenCompra);

        Integer idUsuarioActual = null;
        try {
            idUsuarioActual = securityContextService.obtenerPrincipal().getIdUsuario();
        } catch (Exception e) {
            log.warn("No se pudo obtener el usuario actual para registrar la subida del documento");
        }

        DocumentoOrdenCompra doc = DocumentoOrdenCompra.builder()
                .ordenCompra(ordenCompra)
                .nombreArchivo(archivo.getOriginalFilename())
                .urlArchivo(urlFinal)
                .tipoDocumento(tipoDocumento)
                .fechaSubida(LocalDateTime.now())
                .idUsuarioSubida(idUsuarioActual)
                .build();

        doc = documentoRepo.save(doc);

        return DocumentoOrdenCompraResponseDTO.from(doc);
    }

    @Override
    public List<DocumentoOrdenCompraResponseDTO> listarPorOrden(Integer idOrdenCompra) {
        return documentoRepo.findByOrdenCompra_Id(idOrdenCompra)
                .stream()
                .map(DocumentoOrdenCompraResponseDTO::from)
                .toList();
    }

    @Override
    public void eliminarDocumento(Integer idDocumento) {
        documentoRepo.deleteById(idDocumento);
    }

    @SuppressWarnings("unchecked")
    private String subirACloudinary(MultipartFile archivo, Integer idOrdenCompra) {
        try {
            Object configObj = cloudinary.config.cloudName;
            if (configObj == null || configObj.toString().contains("your_cloud")) {
                log.warn("⚠️ Cloudinary no configurado. Guardando URL placeholder para orden {}.", idOrdenCompra);
                return PLACEHOLDER_PREFIX + archivo.getOriginalFilename();
            }

            // Determinar resource_type en base al contentType
            String resourceType = "auto";
            if (archivo.getContentType() != null && archivo.getContentType().equals("application/pdf")) {
                resourceType = "raw"; // Los PDFs suben mejor como raw o image
            }

            Map<String, Object> params = Map.of(
                    "folder",        "sacpa/ordenes-compra/" + idOrdenCompra,
                    "resource_type", resourceType,
                    "public_id",     "orden_" + idOrdenCompra + "_" + System.currentTimeMillis()
            );

            Map<String, Object> result = cloudinary.uploader().upload(archivo.getBytes(), params);
            return (String) result.get("secure_url");

        } catch (Exception e) {
            log.error("Error al subir a Cloudinary: {}. Usando placeholder.", e.getMessage());
            return PLACEHOLDER_PREFIX + archivo.getOriginalFilename();
        }
    }
}
