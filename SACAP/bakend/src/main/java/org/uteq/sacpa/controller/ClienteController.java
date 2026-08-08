package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.service.entidades.IClienteService;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private IClienteService clienteService;

    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.ok(clienteService.crearCliente(request));
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes(@RequestParam(value = "buscar", required = false) String buscar) {
        if (buscar != null && !buscar.isBlank()) {
            return ResponseEntity.ok(clienteService.buscar(buscar));
        }
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/tecnico/{idTecnico}")
    public ResponseEntity<List<Cliente>> listarPorTecnico(@PathVariable Integer idTecnico) {
        return ResponseEntity.ok(clienteService.listarPorTecnico(idTecnico));
    }
}
