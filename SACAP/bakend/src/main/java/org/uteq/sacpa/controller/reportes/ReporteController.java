package org.uteq.sacpa.controller.reportes;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.reportes.ReporteFiltrosDTO;
import org.uteq.sacpa.dto.reportes.ReporteRespuestaDTO;
import org.uteq.sacpa.service.reportes.IReporteService;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final IReporteService reporteService;

    private String getUsername(Authentication authentication) {
        return authentication.getName();
    }

    private String getRol(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }

    // A. Ventas y Rentabilidad
    @GetMapping("/ventas/productos-mas-vendidos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO')")
    public ResponseEntity<ReporteRespuestaDTO> getProductosMasVendidos(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getProductosMasVendidos(filtros, getUsername(auth), getRol(auth)));
    }

    @GetMapping("/ventas/productos-mayor-ganancia")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR')")
    public ResponseEntity<ReporteRespuestaDTO> getProductosMayorGanancia(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getProductosMayorGanancia(filtros));
    }

    @GetMapping("/ventas/demanda-temporada")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR')")
    public ResponseEntity<ReporteRespuestaDTO> getProductoMayorDemandaTemporada(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getProductoMayorDemandaTemporada(filtros));
    }

    @GetMapping("/ventas/dia-mas-compras")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR')")
    public ResponseEntity<ReporteRespuestaDTO> getDiaMasCompras(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getDiaMasCompras(filtros));
    }

    @GetMapping("/ventas/rotacion-temporada")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO')")
    public ResponseEntity<ReporteRespuestaDTO> getRotacionTemporada(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getRotacionTemporada(filtros, getUsername(auth), getRol(auth)));
    }

    // B. Promociones e IA
    @GetMapping("/promociones/combos-exito")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR')")
    public ResponseEntity<ReporteRespuestaDTO> getCombosMayorExito(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getCombosMayorExito(filtros));
    }

    @GetMapping("/promociones/efectividad-combos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR')")
    public ResponseEntity<ReporteRespuestaDTO> getEfectividadCombos(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getEfectividadCombos(filtros, getUsername(auth), getRol(auth)));
    }

    // C. Inventario y Caducidad
    @GetMapping("/inventario/productos-por-caducar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getProductosPorCaducar(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getProductosPorCaducar(filtros));
    }

    @GetMapping("/inventario/articulos-estancados")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getArticulosEstancados(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getArticulosEstancados(filtros));
    }

    @GetMapping("/inventario/total-almacenado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getTotalInventarioAlmacenado(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getTotalInventarioAlmacenado(filtros, getRol(auth)));
    }

    @GetMapping("/inventario/movimientos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getMovimientosPorProducto(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getMovimientosPorProducto(filtros));
    }

    @GetMapping("/inventario/alertas-criticas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getAlertasCriticas(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getAlertasCriticas(filtros));
    }

    @GetMapping("/inventario/productos-salvados")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getProductosSalvadosCaducidad(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getProductosSalvadosCaducidad(filtros, getUsername(auth), getRol(auth)));
    }

    // D. Operacion Bodega
    @GetMapping("/bodega/ordenes-pendientes")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getOrdenesPendientesDespacho(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getOrdenesPendientesDespacho(filtros, getUsername(auth), getRol(auth)));
    }

    @GetMapping("/bodega/ordenes-despachadas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'BODEGUERO')")
    public ResponseEntity<ReporteRespuestaDTO> getOrdenesDespachadasHoy(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getOrdenesDespachadasHoy(filtros, getUsername(auth), getRol(auth)));
    }

    // E. Clientes
    @GetMapping("/clientes/mas-compran")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO')")
    public ResponseEntity<ReporteRespuestaDTO> getClientesMasCompran(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getClientesMasCompran(filtros, getUsername(auth), getRol(auth)));
    }

    @GetMapping("/clientes/devoluciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO')")
    public ResponseEntity<ReporteRespuestaDTO> getMercaderiaDevueltaPorMes(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getMercaderiaDevueltaPorMes(filtros, getUsername(auth), getRol(auth)));
    }

    @GetMapping("/clientes/churn")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERVISOR', 'TÉCNICO DE CAMPO')")
    public ResponseEntity<ReporteRespuestaDTO> getClientesChurn(@ModelAttribute ReporteFiltrosDTO filtros, Authentication auth) {
        return ResponseEntity.ok(reporteService.getClientesChurn(filtros, getUsername(auth), getRol(auth)));
    }

    // F. Auditoria
    @GetMapping("/auditoria/anulaciones")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ReporteRespuestaDTO> getAuditoriaAnulaciones(@ModelAttribute ReporteFiltrosDTO filtros) {
        return ResponseEntity.ok(reporteService.getAuditoriaAnulaciones(filtros));
    }
}
