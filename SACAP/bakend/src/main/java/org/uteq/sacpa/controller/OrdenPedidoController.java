package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.OrdenPedidoRequestDTO;
import org.uteq.sacpa.entity.operaciones.UsoCampo;
import org.uteq.sacpa.service.operaciones.IUsoCampoService;

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

    @PostMapping
    public ResponseEntity<Map<String, String>> crearOrdenPedido(@Valid @RequestBody OrdenPedidoRequestDTO request) {
        usoCampoService.crearOrdenPedido(request);
        return ResponseEntity.ok(Map.of("mensaje", "Orden de pedido creada exitosamente y stock reservado en bodega"));
    }

    @GetMapping("/tecnico/{idTecnico}")
    public ResponseEntity<List<UsoCampo>> listarPedidosPorTecnico(@PathVariable Integer idTecnico) {
        return ResponseEntity.ok(usoCampoService.listarPedidosPorTecnico(idTecnico));
    }

    @GetMapping("/bodega/pendientes")
    public ResponseEntity<List<UsoCampo>> listarPedidosPendientesBodega() {
        return ResponseEntity.ok(usoCampoService.listarPedidosPendientesBodega());
    }

    @PutMapping("/{idOrden}/despachar")
    public ResponseEntity<Map<String, String>> despacharPedido(@PathVariable Integer idOrden,
                                                               @RequestParam("idUsuarioBodeguero") Integer idUsuarioBodeguero) {
        usoCampoService.despacharPedido(idOrden, idUsuarioBodeguero);
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
