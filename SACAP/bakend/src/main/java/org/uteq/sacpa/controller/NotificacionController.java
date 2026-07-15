package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_alertas.NotificacionRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.Notificacion;
import org.uteq.sacpa.service.ia_alertas.INotificacionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    @Autowired
    private INotificacionService notificacionService;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearNotificacion(@Valid @RequestBody NotificacionRequestDTO request) {
        notificacionService.crearNotificacion(request);
        return ResponseEntity.ok(Map.of("mensaje", "Notificacion creada exitosamente"));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Notificacion>> buscarPorUsuario(@PathVariable Integer idUsuario) {
        return ResponseEntity.ok(notificacionService.buscarPorUsuarioDestino(idUsuario));
    }

    @PutMapping("/{idNotificacion}/leer")
    public ResponseEntity<Map<String, String>> registrarLectura(@PathVariable Integer idNotificacion) {
        notificacionService.registrarLectura(idNotificacion);
        return ResponseEntity.ok(Map.of("mensaje", "Lectura de notificacion registrada"));
    }
}
