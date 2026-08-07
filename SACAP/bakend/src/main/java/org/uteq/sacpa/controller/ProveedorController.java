package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.entidades.ProveedorRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.entidades.IProveedorService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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


    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(proveedorService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> actualizarProveedor(@PathVariable Integer id, @Valid @RequestBody ProveedorRequestDTO request) {
        proveedorService.actualizarProveedor(id, request);
        return ResponseEntity.ok(Map.of("mensaje", "Proveedor actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarProveedor(@PathVariable Integer id) {
        proveedorService.eliminarProveedor(id);

        return ResponseEntity.ok(Map.of("mensaje", "Proveedor eliminado exitosamente"));
    }

    // ==========================================
    // PRODUCTOS DEL PROVEEDOR
    // ==========================================

    @PostMapping("/{id}/productos")
    public ResponseEntity<Map<String, String>> asociarProducto(@PathVariable Integer id, @Valid @RequestBody org.uteq.sacpa.dto.entidades.ProveedorProductoDTO request) {
        request.setIdProveedor(id);
        proveedorService.asociarProducto(request);
        return ResponseEntity.ok(Map.of("mensaje", "Producto asociado exitosamente"));
    }

    @DeleteMapping("/{idProveedor}/productos/{idProducto}")
    public ResponseEntity<Map<String, String>> desasociarProducto(@PathVariable Integer idProveedor, @PathVariable Integer idProducto) {
        proveedorService.desasociarProducto(idProveedor, idProducto);
        return ResponseEntity.ok(Map.of("mensaje", "Producto desasociado exitosamente"));
    }

    @GetMapping("/{id}/productos")
    public ResponseEntity<List<org.uteq.sacpa.dto.entidades.ProveedorProductoDTO>> listarProductosDeProveedor(@PathVariable Integer id) {
        return ResponseEntity.ok(proveedorService.listarProductosDeProveedor(id));
    }
}
