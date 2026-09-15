package org.uteq.sacpa.controller;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.inventario.RegistroTemperaturaRequestDTO;
import org.uteq.sacpa.dto.inventario.RegistroTemperaturaResponseDTO;
import org.uteq.sacpa.entity.inventario.RegistroTemperatura;
import org.uteq.sacpa.entity.inventario.ZonaAlmacen;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.inventario.IRegistroTemperaturaRepository;
import org.uteq.sacpa.repository.inventario.IZonaAlmacenRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bitácora de temperatura/humedad por zona de bodega (AGROCALIDAD Resolución 0227,
 * Anexo 1 punto 20). El Bodeguero registra lecturas periódicas; si la zona tiene un
 * rango definido, se marca automáticamente cuando la lectura queda fuera de rango.
 */
@RestController
@RequestMapping("/api/registros-temperatura")
@RequiredArgsConstructor
public class RegistroTemperaturaController {

    private final IRegistroTemperaturaRepository registroRepository;
    private final IZonaAlmacenRepository zonaRepository;
    private final IUsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<RegistroTemperaturaResponseDTO> registrar(@Valid @RequestBody RegistroTemperaturaRequestDTO dto) {
        ZonaAlmacen zona = zonaRepository.findById(dto.getIdZona())
                .orElseThrow(() -> new EntityNotFoundException("Zona no encontrada: " + dto.getIdZona()));
        Usuario usuario = usuarioRepository.findById(idUsuarioAutenticado())
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado"));

        boolean fueraDeRango = estaFueraDeRango(zona, dto.getTemperatura());

        RegistroTemperatura registro = RegistroTemperatura.builder()
                .zona(zona)
                .temperatura(dto.getTemperatura())
                .humedadRelativa(dto.getHumedadRelativa())
                .fueraDeRango(fueraDeRango)
                .observaciones(dto.getObservaciones())
                .usuarioRegistro(usuario)
                .fechaHora(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(RegistroTemperaturaResponseDTO.from(registroRepository.save(registro)));
    }

    @GetMapping("/zona/{idZona}")
    public ResponseEntity<Page<RegistroTemperaturaResponseDTO>> historialPorZona(@PathVariable Integer idZona, Pageable pageable) {
        return ResponseEntity.ok(registroRepository.findByZona_IdZonaOrderByFechaHoraDesc(idZona, pageable)
                .map(RegistroTemperaturaResponseDTO::from));
    }

    @GetMapping("/almacen/{idAlmacen}")
    public ResponseEntity<Page<RegistroTemperaturaResponseDTO>> historialPorAlmacen(@PathVariable Integer idAlmacen, Pageable pageable) {
        return ResponseEntity.ok(registroRepository.findByZona_Almacen_IdAlmacenOrderByFechaHoraDesc(idAlmacen, pageable)
                .map(RegistroTemperaturaResponseDTO::from));
    }

    private boolean estaFueraDeRango(ZonaAlmacen zona, BigDecimal temperatura) {
        if (zona.getTemperaturaMinima() != null && temperatura.compareTo(zona.getTemperaturaMinima()) < 0) return true;
        if (zona.getTemperaturaMaxima() != null && temperatura.compareTo(zona.getTemperaturaMaxima()) > 0) return true;
        return false;
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
