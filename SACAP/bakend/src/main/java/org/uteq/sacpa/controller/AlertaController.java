package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.ia_alertas.AlertaCaducidadResponseDTO;
import org.uteq.sacpa.dto.ia_alertas.AlertaRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;
import org.uteq.sacpa.repository.catalogos.ICatEstadoAlertaRepository;
import org.uteq.sacpa.security.UsuarioPrincipal;
import org.uteq.sacpa.service.ia_alertas.IAlertaCaducidadService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alertas")
@RequiredArgsConstructor
public class AlertaController {

    private final IAlertaCaducidadService alertaService;
    private final ICatEstadoAlertaRepository catEstadoAlertaRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> crearAlerta(@Valid @RequestBody AlertaRequestDTO request) {
        alertaService.crearAlerta(request);
        return ResponseEntity.ok(Map.of("mensaje", "Alerta de caducidad creada exitosamente"));
    }


    @GetMapping
    public ResponseEntity<Page<AlertaCaducidadResponseDTO>> listarAlertas(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(alertaService.listarAlertasActivas(1, pageable));
    }

    @GetMapping("/activas")
    public ResponseEntity<Page<AlertaCaducidadResponseDTO>> listarAlertasActivas(
            @RequestParam("idEstadoActivo") Integer idEstadoActivo,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(alertaService.listarAlertasActivas(idEstadoActivo, pageable));
    }

    @GetMapping("/lote/{idLote}")
    public ResponseEntity<List<AlertaCaducidadResponseDTO>> buscarPorLote(@PathVariable Integer idLote) {
        return ResponseEntity.ok(alertaService.buscarPorLote(idLote));
    }

    @PutMapping("/{idAlerta}/descartar")
    public ResponseEntity<Map<String, String>> descartarAlerta(
            @PathVariable Integer idAlerta,
            @RequestParam("idEstadoDescartado") Integer idEstadoDescartado) {
        alertaService.descartarAlerta(idAlerta, idEstadoDescartado);
        return ResponseEntity.ok(Map.of("mensaje", "Alerta descartada exitosamente"));
    }

    /** Corre el Motor de Sugerencias sobre el lote de esta alerta y genera una Promoción SUGERIDA */
    @PostMapping("/{idAlerta}/promover")
    public ResponseEntity<PromocionResponseDTO> promoverAlerta(@PathVariable Integer idAlerta) {
        return ResponseEntity.status(201).body(alertaService.promoverAlerta(idAlerta, idUsuarioAutenticado()));
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
