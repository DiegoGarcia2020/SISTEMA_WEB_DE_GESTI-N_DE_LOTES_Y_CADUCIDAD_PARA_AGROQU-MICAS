package org.uteq.sacpa.controller;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.uteq.sacpa.dto.operaciones.RecetaAgricolaRequestDTO;
import org.uteq.sacpa.dto.operaciones.RecetaAgricolaResponseDTO;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.operaciones.RecetaAgricola;
import org.uteq.sacpa.entity.seguridad.Usuario;
import org.uteq.sacpa.repository.entidades.IClienteRepository;
import org.uteq.sacpa.repository.inventario.IProductoRepository;
import org.uteq.sacpa.repository.operaciones.IRecetaAgricolaRepository;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Archivo de recetas agrícolas (AGROCALIDAD Resolución 0227, Anexo 1 punto 25):
 * el Técnico registra aquí la receta firmada por el Ing. Agrónomo/Agropecuario
 * ANTES de poder vender un plaguicida Ia/Ib o de venta restringida a un cliente.
 * Conservar 2 años -- no se expone ningún endpoint de borrado.
 */
@RestController
@RequestMapping("/api/recetas-agricolas")
@RequiredArgsConstructor
public class RecetaAgricolaController {

    private final IRecetaAgricolaRepository recetaAgricolaRepository;
    private final IClienteRepository clienteRepository;
    private final IProductoRepository productoRepository;
    private final IUsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<RecetaAgricolaResponseDTO> registrar(@Valid @RequestBody RecetaAgricolaRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + dto.getIdCliente()));
        Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + dto.getIdProducto()));
        Usuario usuario = usuarioRepository.findById(idUsuarioAutenticado())
                .orElseThrow(() -> new EntityNotFoundException("Usuario autenticado no encontrado"));

        RecetaAgricola receta = RecetaAgricola.builder()
                .numeroAutorizacion(dto.getNumeroAutorizacion())
                .cliente(cliente)
                .producto(producto)
                .nombreProfesional(dto.getNombreProfesional())
                .registroProfesional(dto.getRegistroProfesional())
                .documentoUrl(dto.getDocumentoUrl())
                .fechaEmision(dto.getFechaEmision())
                .usuarioRegistro(usuario)
                .fechaRegistro(LocalDateTime.now())
                .usada(false)
                .build();

        return ResponseEntity.ok(RecetaAgricolaResponseDTO.from(recetaAgricolaRepository.save(receta)));
    }

    /** Recetas disponibles (no usadas) de un cliente -- para elegirlas al armar el carrito. */
    @GetMapping("/cliente/{idCliente}/disponibles")
    public ResponseEntity<List<RecetaAgricolaResponseDTO>> disponiblesPorCliente(@PathVariable Integer idCliente) {
        List<RecetaAgricolaResponseDTO> recetas = recetaAgricolaRepository
                .findByCliente_IdClienteAndUsadaOrderByFechaEmisionDesc(idCliente, false)
                .stream().map(RecetaAgricolaResponseDTO::from).toList();
        return ResponseEntity.ok(recetas);
    }

    private Integer idUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal.getIdUsuario();
        }
        throw new IllegalStateException("No se encontró un usuario autenticado en el contexto de seguridad");
    }
}
