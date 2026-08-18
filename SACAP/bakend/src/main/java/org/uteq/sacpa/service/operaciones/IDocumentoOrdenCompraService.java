package org.uteq.sacpa.service.operaciones;

import org.springframework.web.multipart.MultipartFile;
import org.uteq.sacpa.dto.operaciones.DocumentoOrdenCompraResponseDTO;

import java.util.List;

public interface IDocumentoOrdenCompraService {
    DocumentoOrdenCompraResponseDTO subirDocumento(Integer idOrdenCompra, MultipartFile archivo, String tipoDocumento);
    List<DocumentoOrdenCompraResponseDTO> listarPorOrden(Integer idOrdenCompra);
    void eliminarDocumento(Integer idDocumento);
}
