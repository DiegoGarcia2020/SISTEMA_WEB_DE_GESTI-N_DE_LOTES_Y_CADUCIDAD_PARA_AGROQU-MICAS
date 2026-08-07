package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.VentaRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.service.operaciones.IVentaService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operaciones/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final IVentaService ventaService;


    @PostMapping
    public ResponseEntity<Map<String, Object>> crearVenta(@Valid @RequestBody VentaRequestDTO request) {
        Venta venta = ventaService.crearVenta(request);
        return ResponseEntity.ok(Map.of(
            "mensaje", "Venta creada exitosamente y notificada a bodega",
            "idVenta", venta.getId(),
            "numeroComprobante", venta.getNumeroComprobante(),
            "total", venta.getTotal()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<VentaResponseDTO>> listarVentas() {
        return ResponseEntity.ok(ventaService.listarVentas());

    }
}
