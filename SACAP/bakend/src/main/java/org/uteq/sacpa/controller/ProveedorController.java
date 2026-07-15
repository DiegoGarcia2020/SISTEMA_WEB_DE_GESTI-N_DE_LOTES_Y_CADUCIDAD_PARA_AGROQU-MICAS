package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.entidades.ProveedorRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.service.entidades.IProveedorService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    @Autowired
    private IProveedorService proveedorService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearProveedor(@Valid @RequestBody ProveedorRequestDTO request) {
        proveedorService.crearProveedor(request);
        return ResponseEntity.ok(Map.of("mensaje", "Proveedor registrado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Proveedor>> listarProveedores() {
        return ResponseEntity.ok(proveedorService.listarTodos());
    }

    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<Map<String, String>> eliminarProveedor(@PathVariable Integer idUsuario) {
        proveedorService.eliminarProveedor(idUsuario);
        return ResponseEntity.ok(Map.of("mensaje", "Proveedor eliminado exitosamente"));
    }
}
