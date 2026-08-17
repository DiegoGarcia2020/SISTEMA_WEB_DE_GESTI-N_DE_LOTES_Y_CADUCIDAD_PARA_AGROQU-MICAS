package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ventas.VentaRequestDTO;
import org.uteq.sacpa.dto.ventas.VentasMasVendidosDTO;
import org.uteq.sacpa.service.operaciones.IVentaService;
import org.uteq.sacpa.service.reportes.ReporteVentasService;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private IVentaService ventaService;

    @Autowired
    private ReporteVentasService reporteVentasService;

    @GetMapping("/mas-vendidos")
    public ResponseEntity<VentasMasVendidosDTO> masVendidos(
            @RequestParam(defaultValue = "ESTA_SEMANA") String periodo,
            @RequestParam(defaultValue = "5") int top,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        VentasMasVendidosDTO data = ventaService.masVendidos(periodo, top, desde, hasta);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/json;charset=UTF-8"))
                .body(data);
    }

    @GetMapping("/mas-vendidos/exportar")
    public ResponseEntity<byte[]> exportarMasVendidos(
            @RequestParam(defaultValue = "ESTA_SEMANA") String periodo,
            @RequestParam(defaultValue = "XLSX") String formato,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        VentasMasVendidosDTO data = ventaService.masVendidos(periodo, -1, desde, hasta);
        String ext;
        String contentType;
        byte[] bytes;
        switch (formato.toUpperCase()) {
            case "PDF" -> {
                bytes = reporteVentasService.pdf(data);
                ext = "pdf";
                contentType = "application/pdf";
            }
            case "CSV" -> {
                bytes = reporteVentasService.csv(data);
                ext = "csv";
                contentType = "text/csv;charset=UTF-8";
            }
            default -> {
                bytes = reporteVentasService.excel(data);
                ext = "xlsx";
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
        }
        String nombre = "productos-mas-vendidos-" + periodo.toLowerCase() + "." + ext;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> registrarVenta(@Valid @RequestBody VentaRequestDTO request) {
        ventaService.registrarVenta(request);
        return ResponseEntity.ok(Map.of("mensaje", "Venta registrada exitosamente"));
    }
}
