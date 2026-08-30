package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.inventario.ProductoRequestDTO;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.service.inventario.IProductoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private IProductoService productoService;

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@Valid @RequestBody ProductoRequestDTO request) {
        Producto creado = productoService.crearProducto(request);
        return ResponseEntity.ok(creado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Integer id, @Valid @RequestBody ProductoRequestDTO request) {
        Producto actualizado = productoService.actualizarProducto(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarProductos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @PutMapping("/{idProducto}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarProducto(
            @PathVariable Integer idProducto,
            @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        productoService.desactivarProducto(idProducto, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Producto desactivado exitosamente"));
    }
}
