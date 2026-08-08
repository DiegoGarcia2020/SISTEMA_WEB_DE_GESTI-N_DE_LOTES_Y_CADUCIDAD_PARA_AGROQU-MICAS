package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.VentaRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;
import org.uteq.sacpa.entity.operaciones.Venta;
import org.uteq.sacpa.service.operaciones.IVentaService;
import org.uteq.sacpa.security.SecurityContextService;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operaciones/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final IVentaService ventaService;
    private final SecurityContextService securityContextService;

    private Integer resolverIdOwner(Integer idRecibido, String... rolesOperativos) {
        UsuarioPrincipal principal = securityContextService.obtenerPrincipal();
        boolean esOperativo = principal.getRoles().stream()
                .anyMatch(r -> Arrays.asList(rolesOperativos).contains(r));
        if (esOperativo) {
            return principal.getIdUsuario(); // Ignora el parámetro recibido
        }
        return idRecibido; // ADMINISTRADOR/GERENTE/SUPERVISOR conservan acceso completo
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearVenta(@Valid @RequestBody VentaRequestDTO request) {
        Integer idEfectivo = resolverIdOwner(request.getIdTecnico(), "TECNICO", "TECNICO_CAMPO");
        request.setIdTecnico(idEfectivo);
        Venta venta = ventaService.crearVenta(request);
        return ResponseEntity.ok(Map.of(
            "mensaje", "Venta creada exitosamente y notificada a bodega",
            "idVenta", venta.getId(),
            "numeroComprobante", venta.getNumeroComprobante(),
            "total", venta.getTotal()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponseDTO> obtenerPorId(@PathVariable Integer id) {
        Integer idTecnicoFiltro = resolverIdOwner(null, "TECNICO", "TECNICO_CAMPO");
        return ResponseEntity.ok(ventaService.obtenerPorId(id, idTecnicoFiltro));
    }

    @GetMapping
    public ResponseEntity<List<VentaResponseDTO>> listarVentas() {
        Integer idTecnicoFiltro = resolverIdOwner(null, "TECNICO", "TECNICO_CAMPO");
        return ResponseEntity.ok(ventaService.listarVentas(idTecnicoFiltro));

    }
}
