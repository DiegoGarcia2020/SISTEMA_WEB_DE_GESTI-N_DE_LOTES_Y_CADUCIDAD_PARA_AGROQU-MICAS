package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.seguridad.ProcesarSolicitudDTO;
import org.uteq.sacpa.dto.seguridad.SolicitudRegistroDTO;
import org.uteq.sacpa.service.seguridad.ISolicitudRegistroService;

import java.util.List;

@RestController
@RequestMapping("/api/registro")
@RequiredArgsConstructor
public class SolicitudRegistroController {

    private final ISolicitudRegistroService solicitudService;

    @PostMapping("/solicitar")
    public ResponseEntity<SolicitudRegistroDTO> solicitarRegistro(@Valid @RequestBody SolicitudRegistroDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.crearSolicitud(request));
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudRegistroDTO>> listarPendientes() {
        return ResponseEntity.ok(solicitudService.listarPendientes());
    }

    @GetMapping("/todas")
    public ResponseEntity<List<SolicitudRegistroDTO>> listarTodas() {
        return ResponseEntity.ok(solicitudService.listarTodas());
    }

    @PostMapping("/{id}/procesar")
    public ResponseEntity<Void> procesarSolicitud(@PathVariable Integer id, @Valid @RequestBody ProcesarSolicitudDTO request) {
        solicitudService.procesarSolicitud(id, request);
        return ResponseEntity.ok().build();
    }
}
