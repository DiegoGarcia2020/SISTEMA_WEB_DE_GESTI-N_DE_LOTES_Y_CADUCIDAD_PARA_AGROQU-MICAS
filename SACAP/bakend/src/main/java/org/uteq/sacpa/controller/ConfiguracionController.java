package org.uteq.sacpa.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "*")
public class ConfiguracionController {

    private final Map<String, Object> configGlobal = new HashMap<>();

    public ConfiguracionController() {
        configGlobal.put("nombreEmpresa", "AgroSense SACPA Enterprise");
        configGlobal.put("ruc", "1790001234001");
        configGlobal.put("correoContacto", "soporte@agrosense.ec");
        configGlobal.put("telefonoSoporte", "+593 99 876 5432");
        configGlobal.put("bodegaPrincipal", "Bodega Central - Quevedo");
        configGlobal.put("notificarPorCorreo", true);
        configGlobal.put("notificarPorSms", true);
        configGlobal.put("modoMantenimiento", false);
        configGlobal.put("intervaloSincronizacionMinutos", 15);
        configGlobal.put("versionSistema", "v2.4.0-PROD");
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerConfiguracion() {
        return ResponseEntity.ok(configGlobal);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> actualizarConfiguracion(@RequestBody Map<String, Object> nuevaConfig) {
        if (nuevaConfig != null) {
            configGlobal.putAll(nuevaConfig);
        }
        return ResponseEntity.ok(configGlobal);
    }
}
