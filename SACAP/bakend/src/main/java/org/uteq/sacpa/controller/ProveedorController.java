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

    /**
     * Devuelve el perfil del proveedor vinculado al usuario actualmente autenticado.
     * Usado por el formulario de Pre-registro para auto-completar el idProveedor.
     */
    @GetMapping("/perfil")
    public ResponseEntity<?> miPerfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UsuarioPrincipal principal)) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }
        Optional<Proveedor> proveedor = proveedorService.buscarPorIdUsuario(principal.getIdUsuario());
        return proveedor
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(404).body(Map.of("error", "No se encontró perfil de proveedor para este usuario")));
    }

    /**
     * Endpoint de diagnóstico: devuelve el id_usuario del usuario autenticado
     * y todos los proveedores con su id_usuario para hacer el vínculo correcto.
     * Solo accesible por ADMINISTRADOR en producción, disponible para todos en desarrollo.
     */
    @GetMapping("/diagnostico")
    public ResponseEntity<?> diagnostico() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer idUsuarioActual = null;
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            idUsuarioActual = principal.getIdUsuario();
        }
        var todos = proveedorService.listarTodos();
        var info = new java.util.LinkedHashMap<String, Object>();
        info.put("tu_id_usuario", idUsuarioActual);
        info.put("proveedores_en_bd", todos.stream().map(p -> {
            var m = new java.util.LinkedHashMap<String, Object>();
            m.put("id_proveedor", p.getIdProveedor());
            m.put("nombre", p.getNombre());
            m.put("ruc", p.getRuc());
            m.put("id_usuario_vinculado", p.getUsuario() != null ? p.getUsuario().getIdUsuario() : null);
            return m;
        }).toList());
        info.put("instruccion",
            "Si 'tu_id_usuario' no aparece en 'id_usuario_vinculado', ejecuta en PostgreSQL: " +
            "UPDATE entidades.proveedor SET id_usuario = " + idUsuarioActual +
            " WHERE id_proveedor = <ID_CORRECTO>;"
        );
        return ResponseEntity.ok(info);
    }

    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<Map<String, String>> eliminarProveedor(@PathVariable Integer idUsuario) {
        proveedorService.eliminarProveedor(idUsuario);
        return ResponseEntity.ok(Map.of("mensaje", "Proveedor eliminado exitosamente"));
    }
}
