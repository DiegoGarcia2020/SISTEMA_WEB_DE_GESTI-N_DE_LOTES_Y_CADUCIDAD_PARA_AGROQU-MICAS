package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.OrdenCompraRequestDTO;
import org.uteq.sacpa.dto.operaciones.OrdenCompraResponseDTO;
import org.uteq.sacpa.dto.operaciones.RecepcionLoteRequestDTO;
import org.uteq.sacpa.entity.operaciones.OrdenCompra;
import org.uteq.sacpa.service.operaciones.IOrdenCompraService;
import org.uteq.sacpa.security.SecurityContextService;
import org.uteq.sacpa.security.UsuarioPrincipal;

import org.springframework.data.domain.Page;

import java.util.Arrays;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller REST para el Módulo 1: Compras e Inventario Inicial.
 *
 * Endpoints del Supervisor:
 *   POST   /api/ordenes-compra                         → Crear orden de compra
 *   GET    /api/ordenes-compra                         → Listar con filtros
 *   GET    /api/ordenes-compra/{id}                    → Obtener por ID
 *   PUT    /api/ordenes-compra/{id}/anular             → Anular orden
 *   GET    /api/ordenes-compra/ultimo-precio/{idProd}  → Memoria de precios
 *
 * Endpoints del Bodeguero:
 *   PUT    /api/ordenes-compra/{id}/recepcionar        → Recepcionar y generar lotes
 */
@RestController
@RequestMapping("/api/ordenes-compra")
public class OrdenCompraController {

    @Autowired
    private IOrdenCompraService ordenCompraService;

    @Autowired
    private SecurityContextService securityContextService;

    private Integer resolverIdOwner(Integer idRecibido, String... rolesOperativos) {
        UsuarioPrincipal principal = securityContextService.obtenerPrincipal();
        boolean esOperativo = principal.getRoles().stream()
                .anyMatch(r -> Arrays.asList(rolesOperativos).contains(r));
        if (esOperativo) {
            return principal.getIdUsuario(); // Ignora el parámetro recibido
        }
        return idRecibido; // ADMINISTRADOR/GERENTE/BODEGUERO conservan acceso completo
    }

    /**
     * Crear una nueva orden de compra.
     * El Supervisor transcribe la factura del proveedor.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearOrdenCompra(
            @Valid @RequestBody OrdenCompraRequestDTO request) {
        OrdenCompra orden = ordenCompraService.crearOrdenCompra(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "Orden de compra registrada exitosamente",
                "idOrden", orden.getId(),
                "totalNeto", orden.getTotalNeto()
        ));
    }

    /**
     * Listar órdenes de compra con filtros opcionales.
     * Todos los parámetros son opcionales: si no se envían, lista todo.
     */
    @GetMapping
    public ResponseEntity<List<OrdenCompraResponseDTO>> listarOrdenes(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer idProveedor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        
        Integer idUsuarioRegistroFiltro = resolverIdOwner(null, "SUPERVISOR");
        return ResponseEntity.ok(ordenCompraService.listarOrdenes(estado, idProveedor, desde, hasta, idUsuarioRegistroFiltro));
    }

    /**
     * Recepciones esperadas (Dock Scheduling del Bodeguero): a diferencia de GET /api/ordenes-compra,
     * filtra por fecha de LLEGADA estimada del camión, no por fecha de emisión de la factura.
     */
    @GetMapping("/recepciones-esperadas")
    public ResponseEntity<List<OrdenCompraResponseDTO>> listarRecepcionesEsperadas(
            @RequestParam(required = false) String estado,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        return ResponseEntity.ok(ordenCompraService.listarRecepcionesEsperadas(estado, desde, hasta));
    }

    /**
     * Listar órdenes de compra con paginación y búsqueda por número de factura.
     */
    @GetMapping("/paginadas")
    public ResponseEntity<Page<OrdenCompraResponseDTO>> obtenerOrdenesPaginadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String numeroFactura,
            @RequestParam(required = false) String estado) {
            
        Page<OrdenCompraResponseDTO> resultado = ordenCompraService.obtenerOrdenesPaginadas(numeroFactura, estado, page, size);
        return ResponseEntity.ok(resultado);
    }

    /**
     * Obtener una orden de compra por ID con todos sus detalles.
     * Usado para la Pantalla 3 (Recepción) y para ver detalle de una orden.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrdenCompraResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ordenCompraService.obtenerPorId(id));
    }

    /**
     * Recepcionar una orden de compra.
     * El Bodeguero confirma el ingreso físico y asigna números de lote + fechas de caducidad.
     * Los lotes nacen en estado FLOTANTE con el costo promedio real calculado.
     */
    @PutMapping("/{id}/recepcionar")
    public ResponseEntity<Map<String, String>> recepcionarOrden(
            @PathVariable Integer id,
            @Valid @RequestBody RecepcionLoteRequestDTO request) {
        request.setIdOrdenCompra(id);
        ordenCompraService.recepcionarOrden(request);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Orden recepcionada exitosamente. Lotes generados en estado FLOTANTE."
        ));
    }

    /**
     * Anular una orden de compra.
     * Solo disponible para órdenes en estado PENDIENTE.
     */
    @PutMapping("/{id}/anular")
    public ResponseEntity<Map<String, String>> anularOrden(@PathVariable Integer id) {
        ordenCompraService.anularOrden(id);
        return ResponseEntity.ok(Map.of("mensaje", "Orden de compra anulada exitosamente"));
    }

    /**
     * MEMORIA DE PRECIOS: Obtener el último precio unitario pagado por un producto.
     * El frontend usa esto para autocompletar el campo de precio en el formulario.
     */
    @GetMapping("/ultimo-precio/{idProducto}")
    public ResponseEntity<Map<String, Object>> obtenerUltimoPrecio(@PathVariable Integer idProducto) {
        BigDecimal precio = ordenCompraService.obtenerUltimoPrecioProducto(idProducto);
        if (precio != null) {
            return ResponseEntity.ok(Map.of("precioUnitario", precio, "encontrado", true));
        }
        return ResponseEntity.ok(Map.of("precioUnitario", 0, "encontrado", false));
    }

    // ========================================================================
    // CONTROL DE SLA Y RECEPCIONES (DOCK SCHEDULING)
    // ========================================================================

    @PutMapping("/{id}/llegada-tiempo")
    public ResponseEntity<Map<String, String>> registrarLlegadaTiempo(@PathVariable Integer id) {
        ordenCompraService.registrarLlegadaTiempo(id);
        return ResponseEntity.ok(Map.of("mensaje", "Llegada a tiempo registrada con éxito"));
    }

    @PutMapping("/{id}/reportar-retraso")
    public ResponseEntity<Map<String, String>> reportarRetraso(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String motivo = body.getOrDefault("motivo", "Retraso no justificado");
        ordenCompraService.reportarRetraso(id, motivo);
        return ResponseEntity.ok(Map.of("mensaje", "Retraso reportado y alerta generada"));
    }

    @PutMapping("/{id}/cancelar-sla")
    public ResponseEntity<Map<String, String>> cancelarOrdenSLA(@PathVariable Integer id) {
        ordenCompraService.cancelarOrdenCompra(id);
        return ResponseEntity.ok(Map.of("mensaje", "Orden cancelada por incumplimiento de entrega"));
    }
}
