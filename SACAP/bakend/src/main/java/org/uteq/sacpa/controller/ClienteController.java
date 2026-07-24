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
