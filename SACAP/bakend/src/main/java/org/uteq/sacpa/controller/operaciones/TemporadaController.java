package org.uteq.sacpa.controller.operaciones;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.TemporadaRequestDTO;
import org.uteq.sacpa.dto.operaciones.TemporadaResponseDTO;
import org.uteq.sacpa.service.operaciones.ITemporadaService;

import java.util.List;

@RestController("temporadaControllerOperaciones")
@RequestMapping("/api/operaciones/temporadas")
@RequiredArgsConstructor
public class TemporadaController {

    private final ITemporadaService temporadaService;

    @PostMapping("/aperturar")
    public ResponseEntity<TemporadaResponseDTO> aperturarTemporada(@RequestBody TemporadaRequestDTO request) {
        TemporadaResponseDTO nuevaTemporada = temporadaService.aperturarTemporada(request);
        return ResponseEntity.ok(nuevaTemporada);
    }

    @GetMapping("/activa")
    public ResponseEntity<TemporadaResponseDTO> obtenerTemporadaActiva() {
        TemporadaResponseDTO activa = temporadaService.obtenerTemporadaActiva();
        if (activa == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activa);
    }

    @GetMapping
    public ResponseEntity<List<TemporadaResponseDTO>> listarTemporadas() {
        List<TemporadaResponseDTO> temporadas = temporadaService.listarTemporadas();
        return ResponseEntity.ok(temporadas);
    }
}
