package org.uteq.sacpa.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.catalogos.CatalogoRequestDTO;
import org.uteq.sacpa.entity.catalogos.*;
import org.uteq.sacpa.service.catalogos.ICatalogoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    @Autowired
    private ICatalogoService catalogoService;

    // Endpoint unificado para el frontend (gestión de catálogos)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarTodosLosCatalogos() {
        List<Map<String, Object>> unificado = new java.util.ArrayList<>();
        int i = 1;
        for (CatEstadoGeneral eg : catalogoService.listarEstadosGenerales()) {
            unificado.add(Map.of(
                "idItem", eg.getIdEstado(),
                "categoria", "ESTADOS_USUARIO",
                "codigo", "GEN_" + eg.getIdEstado(),
                "nombre", eg.getNombre(),
                "descripcion", "Estado General de Sistema",
                "activo", eg.getActivo() != null ? eg.getActivo() : true,
                "orden", i++
            ));
        }
        for (CatEstadoLote el : catalogoService.listarEstadosLote()) {
            unificado.add(Map.of(
                "idItem", el.getIdEstadoLote(),
                "categoria", "TIPOS_LOTE",
                "codigo", "LOTE_" + el.getIdEstadoLote(),
                "nombre", el.getNombre(),
                "descripcion", "Estado de Lote Agrícola",
                "activo", el.getActivo() != null ? el.getActivo() : true,
                "orden", i++
            ));
        }
        for (CatEstadoAprobacion ea : catalogoService.listarEstadosAprobacion()) {
            unificado.add(Map.of(
                "idItem", ea.getIdEstadoAprobacion(),
                "categoria", "ESTADOS_ORDEN",
                "codigo", "APROB_" + ea.getIdEstadoAprobacion(),
                "nombre", ea.getNombre(),
                "descripcion", "Estado de Aprobación Documental",
                "activo", ea.getActivo() != null ? ea.getActivo() : true,
                "orden", i++
            ));
        }
        for (CatNivelAlerta na : catalogoService.listarNivelesAlerta()) {
            unificado.add(Map.of(
                "idItem", na.getIdNivelAlerta(),
                "categoria", "UNIDADES_MEDIDA",
                "codigo", "ALERT_" + na.getIdNivelAlerta(),
                "nombre", na.getNombre(),
                "descripcion", "Nivel de Alerta IA",
                "activo", true,
                "orden", i++
            ));
        }
        for (CatTipoMovimiento tm : catalogoService.listarTiposMovimiento()) {
            unificado.add(Map.of(
                "idItem", tm.getIdTipoMovimiento(),
                "categoria", "TIPOS_AGROQUIMICO",
                "codigo", "MOV_" + tm.getIdTipoMovimiento(),
                "nombre", tm.getNombre(),
                "descripcion", tm.getNaturaleza() != null ? "Naturaleza: " + tm.getNaturaleza() : "Tipo de Movimiento Bodega",
                "activo", tm.getActivo() != null ? tm.getActivo() : true,
                "orden", i++
            ));
        }
        return ResponseEntity.ok(unificado);
    }

    // Estado General
    @GetMapping("/estados-generales")
    public ResponseEntity<List<CatEstadoGeneral>> listarEstadosGenerales() {
        return ResponseEntity.ok(catalogoService.listarEstadosGenerales());
    }

    @PostMapping("/estados-generales")
    public ResponseEntity<Map<String, String>> crearEstadoGeneral(@Valid @RequestBody CatalogoRequestDTO request) {
        catalogoService.crearEstadoGeneral(request);
        return ResponseEntity.ok(Map.of("mensaje", "Estado general creado exitosamente"));
    }

    // Estado Lote
    @GetMapping("/estados-lote")
    public ResponseEntity<List<CatEstadoLote>> listarEstadosLote() {
        return ResponseEntity.ok(catalogoService.listarEstadosLote());
    }

    @PostMapping("/estados-lote")
    public ResponseEntity<Map<String, String>> crearEstadoLote(@Valid @RequestBody CatalogoRequestDTO request) {
        catalogoService.crearEstadoLote(request);
        return ResponseEntity.ok(Map.of("mensaje", "Estado de lote creado exitosamente"));
    }

    // Estado Aprobacion
    @GetMapping("/estados-aprobacion")
    public ResponseEntity<List<CatEstadoAprobacion>> listarEstadosAprobacion() {
        return ResponseEntity.ok(catalogoService.listarEstadosAprobacion());
    }

    @PostMapping("/estados-aprobacion")
    public ResponseEntity<Map<String, String>> crearEstadoAprobacion(@Valid @RequestBody CatalogoRequestDTO request) {
        catalogoService.crearEstadoAprobacion(request);
        return ResponseEntity.ok(Map.of("mensaje", "Estado de aprobacion creado exitosamente"));
    }

    // Nivel Alerta
    @GetMapping("/niveles-alerta")
    public ResponseEntity<List<CatNivelAlerta>> listarNivelesAlerta() {
        return ResponseEntity.ok(catalogoService.listarNivelesAlerta());
    }

    @PostMapping("/niveles-alerta")
    public ResponseEntity<Map<String, String>> crearNivelAlerta(@Valid @RequestBody CatalogoRequestDTO request) {
        catalogoService.crearNivelAlerta(request);
        return ResponseEntity.ok(Map.of("mensaje", "Nivel de alerta creado exitosamente"));
    }

    // Tipo Movimiento
    @GetMapping("/tipos-movimiento")
    public ResponseEntity<List<CatTipoMovimiento>> listarTiposMovimiento() {
        return ResponseEntity.ok(catalogoService.listarTiposMovimiento());
    }

    @PostMapping("/tipos-movimiento")
    public ResponseEntity<Map<String, String>> crearTipoMovimiento(@Valid @RequestBody CatalogoRequestDTO request) {
        catalogoService.crearTipoMovimiento(request);
        return ResponseEntity.ok(Map.of("mensaje", "Tipo de movimiento creado exitosamente"));
    }
}
