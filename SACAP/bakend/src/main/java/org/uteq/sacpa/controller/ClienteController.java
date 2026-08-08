package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.service.entidades.IClienteService;
import org.uteq.sacpa.security.SecurityContextService;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private IClienteService clienteService;

    @Autowired
    private SecurityContextService securityContextService;

    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.ok(clienteService.crearCliente(request));
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes(@RequestParam(value = "buscar", required = false) String buscar) {
        UsuarioPrincipal principal = securityContextService.obtenerPrincipal();
        boolean esTecnico = principal.getRoles().stream()
                .anyMatch(r -> r.equals("TECNICO") || r.equals("TECNICO_CAMPO"));

        if (buscar != null && !buscar.isBlank()) {
            if (esTecnico) {
                return ResponseEntity.ok(clienteService.buscarPorTecnico(buscar, principal.getIdUsuario()));
            }
            return ResponseEntity.ok(clienteService.buscar(buscar));
        }
        if (esTecnico) {
            return ResponseEntity.ok(clienteService.listarPorTecnico(principal.getIdUsuario()));
        }
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/tecnico/{idTecnico}")
    public ResponseEntity<List<Cliente>> listarPorTecnico(@PathVariable Integer idTecnico) {
        UsuarioPrincipal principal = securityContextService.obtenerPrincipal();
        boolean esTecnico = principal.getRoles().stream()
                .anyMatch(r -> r.equals("TECNICO") || r.equals("TECNICO_CAMPO"));
        
        Integer idEfectivo = esTecnico ? principal.getIdUsuario() : idTecnico;
        return ResponseEntity.ok(clienteService.listarPorTecnico(idEfectivo));
    }
}
