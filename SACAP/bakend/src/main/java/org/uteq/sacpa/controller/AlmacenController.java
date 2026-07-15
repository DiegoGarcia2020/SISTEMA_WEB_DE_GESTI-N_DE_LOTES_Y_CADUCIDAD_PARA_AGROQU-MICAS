package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.inventario.AlmacenRequestDTO;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.service.inventario.IAlmacenService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/almacenes")
public class AlmacenController {

    @Autowired
    private IAlmacenService almacenService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearAlmacen(@Valid @RequestBody AlmacenRequestDTO request) {
        almacenService.crearAlmacen(request);
        return ResponseEntity.ok(Map.of("mensaje", "Almacen creado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Almacen>> listarAlmacenes() {
        return ResponseEntity.ok(almacenService.listarTodos());
    }

    @PutMapping("/{idAlmacen}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarAlmacen(
            @PathVariable Integer idAlmacen,
            @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        almacenService.desactivarAlmacen(idAlmacen, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Almacen desactivado exitosamente"));
    }
}
