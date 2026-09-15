package org.uteq.sacpa.util;

import org.springframework.web.multipart.MultipartFile;
import org.uteq.sacpa.exception.BadRequestException;

import java.util.Set;

/**
 * Validación centralizada de archivos subidos por el usuario (documentos institucionales,
 * documentos de lote, órdenes de compra, foto de perfil). Antes de esto cualquier
 * MultipartFile se enviaba directo a Cloudinary sin verificar tipo ni tamaño real --
 * alguien podía subir un .exe/.html renombrado, o un archivo enorme antes de que
 * Cloudinary lo rechazara.
 */
public final class ArchivoValidator {

    private static final Set<String> TIPOS_DOCUMENTO_PERMITIDOS = Set.of(
            "application/pdf", "image/jpeg", "image/png", "image/webp"
    );
    private static final Set<String> EXTENSIONES_DOCUMENTO_PERMITIDAS = Set.of(
            "pdf", "jpg", "jpeg", "png", "webp"
    );
    private static final long TAMANIO_MAXIMO_DOCUMENTO = 10L * 1024 * 1024; // 10MB

    private ArchivoValidator() {}

    /** Valida un documento adjunto (PDF/imagen): tipo MIME, extensión y tamaño. */
    public static void validarDocumento(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("Debe adjuntar un archivo.");
        }
        if (archivo.getSize() > TAMANIO_MAXIMO_DOCUMENTO) {
            throw new BadRequestException("El archivo supera el tamaño máximo permitido (10MB).");
        }
        String contentType = archivo.getContentType();
        if (contentType == null || !TIPOS_DOCUMENTO_PERMITIDOS.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Tipo de archivo no permitido. Solo se aceptan PDF o imágenes (JPG, PNG, WEBP).");
        }
        String nombre = archivo.getOriginalFilename();
        String extension = nombre != null && nombre.contains(".")
                ? nombre.substring(nombre.lastIndexOf('.') + 1).toLowerCase()
                : "";
        if (!EXTENSIONES_DOCUMENTO_PERMITIDAS.contains(extension)) {
            throw new BadRequestException("Extensión de archivo no permitida. Solo se aceptan: "
                    + String.join(", ", EXTENSIONES_DOCUMENTO_PERMITIDAS) + ".");
        }
    }
}
