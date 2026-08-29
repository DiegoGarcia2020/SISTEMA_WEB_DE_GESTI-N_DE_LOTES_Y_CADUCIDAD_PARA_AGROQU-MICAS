package org.uteq.sacpa.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.repository.inventario.IProductoRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "*")
public class ConfiguracionController {

    @Autowired
    private IProductoRepository productoRepository;

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
        configGlobal.put("porcentajeIvaGlobal", 15.00);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerConfiguracion() {
        return ResponseEntity.ok(configGlobal);
    }

    /** Endpoint dedicado para que el formulario de productos consulte el IVA global */
    @GetMapping("/iva-global")
    public ResponseEntity<Map<String, Object>> obtenerIvaGlobal() {
        Object iva = configGlobal.getOrDefault("porcentajeIvaGlobal", 15.00);
        return ResponseEntity.ok(Map.of("porcentajeIvaGlobal", iva));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> actualizarConfiguracion(@RequestBody Map<String, Object> nuevaConfig) {
        if (nuevaConfig != null) {
            // Detectar si cambió el IVA global para propagar a productos
            Object nuevoIvaObj = nuevaConfig.get("porcentajeIvaGlobal");
            Object ivaAnteriorObj = configGlobal.get("porcentajeIvaGlobal");

            configGlobal.putAll(nuevaConfig);

            // Propagar cambio de IVA a productos si cambió
            if (nuevoIvaObj != null && ivaAnteriorObj != null) {
                BigDecimal nuevoIva = new BigDecimal(nuevoIvaObj.toString());
                BigDecimal ivaAnterior = new BigDecimal(ivaAnteriorObj.toString());

                if (nuevoIva.compareTo(ivaAnterior) != 0) {
                    // Productos con porcentaje >= nuevo global: bajarlos al nuevo global
                    productoRepository.ajustarIvaGlobal(nuevoIva);
                }
            }
        }
        return ResponseEntity.ok(configGlobal);
    }
}
