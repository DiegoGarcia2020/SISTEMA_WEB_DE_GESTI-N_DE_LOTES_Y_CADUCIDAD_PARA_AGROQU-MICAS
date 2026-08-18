package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.DevolucionFisicaRequestDTO;
import org.uteq.sacpa.dto.operaciones.DevolucionVentaRequestDTO;
import org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO;
import org.uteq.sacpa.service.operaciones.IDevolucionVentaService;

@RestController
@RequestMapping("/api/operaciones/devoluciones-venta")
@RequiredArgsConstructor
public class DevolucionVentaController {

    private final IDevolucionVentaService devolucionService;
    private final org.uteq.sacpa.security.SecurityContextService securityContextService;

    @PostMapping("/campo")
    public ResponseEntity<?> registrarDevolucionCampo(@Valid @RequestBody DevolucionVentaRequestDTO request) {
        return ResponseEntity.ok(devolucionService.registrarDevolucionCampo(request));
    }

    @PutMapping("/{idDevolucion}/recibir-fisica")
    public ResponseEntity<?> recibirDevolucionFisica(
            @PathVariable Integer idDevolucion,
            @Valid @RequestBody DevolucionFisicaRequestDTO request) {
        return ResponseEntity.ok(devolucionService.recibirDevolucionFisica(idDevolucion, request));
    }

    @GetMapping("/pendientes-bodega")
    public ResponseEntity<Page<DevolucionVentaResponseDTO>> listarPendientesBodega(
            @PageableDefault(size = 20, sort = "fechaSolicitud", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(devolucionService.listarPendientesBodega(pageable));
    }
    
    @GetMapping("/mis-devoluciones")
    public ResponseEntity<java.util.List<org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO>> listarMisDevoluciones() {
        Integer idTecnico = securityContextService.obtenerPrincipal().getIdUsuario();
        return ResponseEntity.ok(devolucionService.listarPorTecnico(idTecnico));
    }
}
