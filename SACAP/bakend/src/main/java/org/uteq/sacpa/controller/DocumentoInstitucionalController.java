package org.uteq.sacpa.controller;

import com.cloudinary.Cloudinary;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.uteq.sacpa.dto.inventario.DocumentoInstitucionalResponseDTO;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.entity.inventario.DocumentoInstitucional;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.inventario.IAlmacenRepository;
import org.uteq.sacpa.repository.inventario.IDocumentoInstitucionalRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Archivo de documentos institucionales del establecimiento (AGROCALIDAD Resolución 0227,
 * Anexo 1, puntos 1-2): permiso de funcionamiento, LUAE, RUC, certificado ambiental,
 * registro sanitario -- disponibles para inspección. Solo Administrador/Supervisor gestionan
 * este archivo; cualquier usuario autenticado puede consultarlo.
 */
@RestController
@RequestMapping("/api/documentos-institucionales")
@RequiredArgsConstructor
@Slf4j
public class DocumentoInstitucionalController {

    private static final String PLACEHOLDER_PREFIX = "PENDIENTE_CLOUDINARY://";

    private final IDocumentoInstitucionalRepository documentoRepository;
    private final IAlmacenRepository almacenRepository;
    private final IUsuarioRepository usuarioRepository;
    private final Cloudinary cloudinary;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'SUPERVISOR')")
    public ResponseEntity<DocumentoInstitucionalResponseDTO> subirDocumento(
            @RequestPart("archivo") MultipartFile archivo,
            @RequestParam("tipoDocumento") String tipoDocumento,
            @RequestParam(value = "idAlmacen", required = false) Integer idAlmacen,
            @RequestParam(value = "fechaEmision", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fechaEmision,
            @RequestParam(value = "fechaVencimiento", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fechaVencimiento) {

        org.uteq.sacpa.util.ArchivoValidator.validarDocumento(archivo);

        Almacen almacen = idAlmacen != null
                ? almacenRepository.findById(idAlmacen).orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado: " + idAlmacen))
                : null;
        Usuario usuario = usuarioRepository.findById(idUsuarioAutenticado())
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado"));

        String urlFinal = subirACloudinary(archivo, tipoDocumento);

        DocumentoInstitucional doc = DocumentoInstitucional.builder()
                .almacen(almacen)
                .tipoDocumento(tipoDocumento)
                .nombreArchivo(archivo.getOriginalFilename())
                .rutaArchivo(urlFinal)
                .fechaEmision(fechaEmision)
                .fechaVencimiento(fechaVencimiento)
                .usuarioSubida(usuario)
                .fechaSubida(LocalDateTime.now())
                .build();

        return ResponseEntity.status(201).body(DocumentoInstitucionalResponseDTO.from(documentoRepository.save(doc)));
    }

    @GetMapping
    public ResponseEntity<List<DocumentoInstitucionalResponseDTO>> listar(@RequestParam(value = "idAlmacen", required = false) Integer idAlmacen) {
        List<DocumentoInstitucional> docs = idAlmacen != null
                ? documentoRepository.findByAlmacen(idAlmacen)
                : documentoRepository.findAllConDetalle();
        return ResponseEntity.ok(docs.stream().map(DocumentoInstitucionalResponseDTO::from).toList());
    }

    @DeleteMapping("/{idDocumento}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'SUPERVISOR')")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Integer idDocumento) {
        if (!documentoRepository.existsById(idDocumento)) {
            throw new EntityNotFoundException("Documento no encontrado: " + idDocumento);
        }
        documentoRepository.deleteById(idDocumento);
        return ResponseEntity.ok(Map.of("mensaje", "Documento eliminado exitosamente"));
    }

    @SuppressWarnings("unchecked")
    private String subirACloudinary(MultipartFile archivo, String tipoDocumento) {
        try {
            Object cloudName = cloudinary.config.cloudName;
            if (cloudName == null || cloudName.toString().contains("your_cloud")) {
                log.warn(">>> [DOCUMENTOS INSTITUCIONALES] Cloudinary no configurado. Guardando URL placeholder para {}.", tipoDocumento);
                return PLACEHOLDER_PREFIX + archivo.getOriginalFilename();
            }

            Map<String, Object> params = Map.of(
                    "folder", "sacpa/institucional",
                    "resource_type", "raw",
                    "public_id", tipoDocumento.replaceAll("\\s+", "_") + "_" + System.currentTimeMillis()
            );

            Map<String, Object> result = cloudinary.uploader().upload(archivo.getBytes(), params);
            return (String) result.get("secure_url");
        } catch (Exception e) {
            log.error("Error al subir documento institucional a Cloudinary: {}. Usando placeholder.", e.getMessage());
            return PLACEHOLDER_PREFIX + archivo.getOriginalFilename();
        }
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
