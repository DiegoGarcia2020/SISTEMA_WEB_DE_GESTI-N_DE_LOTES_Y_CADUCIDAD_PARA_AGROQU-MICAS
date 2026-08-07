package org.uteq.sacpa.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;

import org.uteq.sacpa.service.entidades.IClienteService;

import java.util.List;
import java.util.Map;


/** Clientes/Finqueros — Módulo 3 (Ventas). Sin cuenta de usuario, los crea el Técnico al vender. */
@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final IClienteService clienteService;

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> crearCliente(@Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.status(201).body(clienteService.crearCliente(request));
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listarClientes(
            @RequestParam(value = "buscar", required = false) String buscar) {
        if (buscar != null && !buscar.isBlank()) {
            return ResponseEntity.ok(clienteService.buscar(buscar));
        }
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @PutMapping("/{idCliente}")
    public ResponseEntity<ClienteResponseDTO> actualizarCliente(
            @PathVariable Integer idCliente, @Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.ok(clienteService.actualizarCliente(idCliente, request));
    }

    @PutMapping("/{idCliente}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarCliente(
            @PathVariable Integer idCliente, @RequestParam("idEstadoInactivo") Integer idEstadoInactivo) {
        clienteService.desactivarCliente(idCliente, idEstadoInactivo);
        return ResponseEntity.ok(Map.of("mensaje", "Cliente desactivado exitosamente"));

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private IClienteService clienteService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearCliente(@Valid @RequestBody ClienteRequestDTO request) {
        clienteService.crearCliente(request);
        return ResponseEntity.ok(Map.of("mensaje", "Cliente/Finca creado exitosamente"));
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/tecnico/{idTecnico}")
    public ResponseEntity<List<Cliente>> listarPorTecnico(@PathVariable Integer idTecnico) {
        return ResponseEntity.ok(clienteService.listarPorTecnico(idTecnico));

    }
}
