package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.OrdenPedidoRequestDTO;
import org.uteq.sacpa.dto.operaciones.PedidoResponseDTO;
import org.uteq.sacpa.service.operaciones.IUsoCampoService;
import org.uteq.sacpa.security.SecurityContextService;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Controlador de Ventas Agroindustriales (Técnico-Comercial & Bodeguero).
 * Gestiona la creación de órdenes de pedido, despacho FEFO al cliente y devoluciones.
 */
@RestController
@RequestMapping("/api/operaciones/pedidos")
public class OrdenPedidoController {

    @Autowired
    private IUsoCampoService usoCampoService;

    @Autowired
    private SecurityContextService securityContextService;

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
    public ResponseEntity<Map<String, String>> crearOrdenPedido(@Valid @RequestBody OrdenPedidoRequestDTO request) {
        Integer idEfectivo = resolverIdOwner(request.getIdTecnico(), "TECNICO", "TECNICO_CAMPO");
        request.setIdTecnico(idEfectivo);
        usoCampoService.crearOrdenPedido(request);
        return ResponseEntity.ok(Map.of("mensaje", "Orden de pedido creada exitosamente y stock reservado en bodega"));
    }

    @GetMapping("/tecnico/{idTecnico}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorTecnico(@PathVariable Integer idTecnico) {
        Integer idEfectivo = resolverIdOwner(idTecnico, "TECNICO", "TECNICO_CAMPO");
        return ResponseEntity.ok(usoCampoService.listarPedidosPorTecnico(idEfectivo));
    }

    @GetMapping("/bodega/pendientes")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPendientesBodega() {
        return ResponseEntity.ok(usoCampoService.listarPedidosPendientesBodega());
    }

    @PutMapping("/{idOrden}/despachar")
    public ResponseEntity<Map<String, String>> despacharPedido(@PathVariable Integer idOrden,
                                                               @RequestParam("idUsuarioBodeguero") Integer idUsuarioBodeguero) {
        Integer idEfectivo = resolverIdOwner(idUsuarioBodeguero, "BODEGUERO");
        usoCampoService.despacharPedido(idOrden, idEfectivo);
        return ResponseEntity.ok(Map.of("mensaje", "Pedido despachado exitosamente al cliente. Reserva liberada y stock descontado."));
    }

    @PostMapping("/devolucion-cliente")
    public ResponseEntity<Map<String, String>> devolucionCliente(
            @RequestParam(value = "idPedidoOriginal", required = false) Integer idPedidoOriginal,
            @RequestParam("motivo") String motivo,
            @RequestParam("cantidad") Integer cantidad,
            @RequestParam("idLote") Integer idLote,
            @RequestParam("idUsuario") Integer idUsuario) {
        usoCampoService.registrarDevolucionCliente(idPedidoOriginal, motivo, cantidad, idLote, idUsuario);
        return ResponseEntity.ok(Map.of("mensaje", "Devolución de cliente registrada. Stock reintegrado al lote."));
    }
}
