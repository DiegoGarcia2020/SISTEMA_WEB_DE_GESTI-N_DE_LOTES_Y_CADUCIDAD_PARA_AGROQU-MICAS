package org.uteq.sacpa.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.entity.seguridad.Auditoria;
import org.uteq.sacpa.entity.seguridad.HistorialSesion;
import org.uteq.sacpa.service.seguridad.IAuditoriaService;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seguridad")
@RequiredArgsConstructor
public class AuditoriaController {

    private final IAuditoriaService auditoriaService;
    private final ObjectMapper objectMapper;

    // --- AUDITORÍA ---
    @GetMapping("/auditoria")
    public ResponseEntity<List<Map<String, Object>>> listarAuditoria() {
        List<Map<String, Object>> res = new java.util.ArrayList<>();
        for (Auditoria a : auditoriaService.listarAuditoria()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("idAuditoria", a.getIdAuditoria());
            item.put("fechaHora", a.getFechaHora() != null ? a.getFechaHora().toString().replace("T", " ").substring(0, Math.min(19, a.getFechaHora().toString().length())) : "");
            item.put("usuario", a.getUsuario() != null ? a.getUsuario().getCorreo() : "SISTEMA");
            item.put("rol", a.getOperacion() != null ? a.getOperacion() : "SISTEMA");
            item.put("accion", a.getAccion() != null ? a.getAccion() : "UPDATE");
            item.put("tablaAfectada", a.getTablaAfectada() != null ? a.getTablaAfectada() : "SACPA");
            item.put("detalleCambio", a.getDescripcion() != null ? a.getDescripcion() : "Modificación de registro");
            item.put("direccionIp", "127.0.0.1");
            item.put("valorAnterior", parseJson(a.getValorAnterior()));
            item.put("valorNuevo", parseJson(a.getValorNuevo()));
            res.add(item);
        }
        return ResponseEntity.ok(res);
    }

    private Object parseJson(String texto) {
        if (texto == null || texto.isBlank()) return null;
        try {
            return objectMapper.readValue(texto, Object.class);
        } catch (Exception e) {
            return texto;
        }
    }

    @PostMapping("/auditoria")
    public ResponseEntity<Auditoria> registrarAuditoria(@RequestBody Map<String, Object> datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auditoriaService.registrarAuditoria(datos));
    }

    // --- HISTORIAL DE SESIONES ---
    @GetMapping("/historial-sesion")
    public ResponseEntity<List<Map<String, Object>>> listarHistorialSesiones() {
        List<Map<String, Object>> res = new java.util.ArrayList<>();
        for (HistorialSesion s : auditoriaService.listarHistorialSesiones()) {
            res.add(Map.of(
                "idSesion", s.getIdSesion(),
                "correoUsuario", s.getUsuario() != null ? s.getUsuario().getCorreo() : "usuario@agrosense.ec",
                "rolSeleccionado", s.getRolUtilizado() != null ? s.getRolUtilizado() : "ADMINISTRADOR",
                "direccionIp", s.getIpAcceso() != null ? s.getIpAcceso() : "127.0.0.1",
                "fechaInicio", s.getFechaIngreso() != null ? s.getFechaIngreso().toString().replace("T", " ").substring(0, Math.min(19, s.getFechaIngreso().toString().length())) : "",
                "fechaFin", s.getFechaSalida() != null ? s.getFechaSalida().toString().replace("T", " ").substring(0, Math.min(19, s.getFechaSalida().toString().length())) : "",
                "estadoConexion", s.getFechaSalida() == null ? "ACTIVA" : "CERRADA",
                "dispositivo", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            ));
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/historial-sesion/usuario/{idUsuario}")
    public ResponseEntity<List<HistorialSesion>> listarSesionesPorUsuario(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(auditoriaService.listarSesionesPorUsuario(idUsuario));
    }

    @PostMapping("/historial-sesion")
    public ResponseEntity<Void> registrarIngresoSesion(@RequestBody Map<String, Object> datos) {
        auditoriaService.registrarIngresoSesion(datos);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/historial-sesion/{idSesion}/salida")
    public ResponseEntity<Void> registrarSalidaSesion(@PathVariable Long idSesion) {
        auditoriaService.registrarSalidaSesion(idSesion);
        return ResponseEntity.noContent().build();
    }
}
