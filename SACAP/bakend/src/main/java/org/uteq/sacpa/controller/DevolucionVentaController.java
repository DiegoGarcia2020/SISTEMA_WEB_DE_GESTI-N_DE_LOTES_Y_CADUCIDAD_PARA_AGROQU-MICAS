package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.DevolucionVentaRequestDTO;
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
            @RequestParam String estadoInventario) {
        return ResponseEntity.ok(devolucionService.recibirDevolucionFisica(idDevolucion, estadoInventario));
    }

    @GetMapping("/pendientes-bodega")
    public ResponseEntity<java.util.List<org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO>> listarPendientesBodega() {
        return ResponseEntity.ok(devolucionService.listarPendientesBodega());
    }
    
    @GetMapping("/mis-devoluciones")
    public ResponseEntity<java.util.List<org.uteq.sacpa.dto.operaciones.DevolucionVentaResponseDTO>> listarMisDevoluciones() {
        Integer idTecnico = securityContextService.obtenerPrincipal().getIdUsuario();
        return ResponseEntity.ok(devolucionService.listarPorTecnico(idTecnico));
    }
}
