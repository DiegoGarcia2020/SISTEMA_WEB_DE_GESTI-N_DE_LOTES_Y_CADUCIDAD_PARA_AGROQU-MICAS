package org.uteq.sacpa.service.inventario.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.inventario.LotePreRegistroDTO;
import org.uteq.sacpa.dto.inventario.LoteRequestDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteValidacionDTO;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.entity.inventario.UbicacionInterna;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.inventario.IUbicacionInternaRepository;
import org.uteq.sacpa.service.inventario.ILoteService;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoteServiceImpl implements ILoteService {

    private static final int ID_ESTADO_EN_REVISION = 2; // cat_estado_lote → EN_REVISION
    private static final int ID_ESTADO_ACTIVO       = 1; // cat_estado_lote → ACTIVO

    private final ILoteRepository            loteRepository;
    private final IUbicacionInternaRepository ubicacionRepository;
    private final JdbcTemplate               jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            // Eliminar la restricción NOT NULL de id_ubicacion para permitir el pre-registro por parte del proveedor.
            jdbcTemplate.execute("ALTER TABLE inventario.lotes ALTER COLUMN id_ubicacion DROP NOT NULL");
            // Eliminar la restricción lotes_check que valida que la fecha de vencimiento sea mayor
            jdbcTemplate.execute("ALTER TABLE inventario.lotes DROP CONSTRAINT IF EXISTS lotes_check");
        } catch (Exception e) {
            // Si falla, es probable que ya se haya eliminado o que no tenga permisos, pero continuamos.
        }
    }

    // ── Creación directa (flujo admin) ──────────────────────

    @Override
    public void crearLote(LoteRequestDTO dto) {
        loteRepository.crearLote(
                dto.getNumeroLote(), dto.getFechaFabricacion(), dto.getFechaVencimiento(),
                dto.getCantidadInicial(), dto.getIdProducto(), dto.getIdProveedor(),
                dto.getIdUbicacion(), dto.getIdEstadoLote()
        );
    }

    // ── Flujo 2 pasos (Proveedor → Bodeguero) ───────────────

    @Override
    @Transactional
    public LoteResponseDTO preRegistrarLote(LotePreRegistroDTO dto) {
        // Crea el lote sin ubicacion (null) y en estado EN_REVISION
        loteRepository.crearLote(
                dto.getNumeroLote(), dto.getFechaFabricacion(), dto.getFechaVencimiento(),
                dto.getCantidadDeclarada(), dto.getIdProducto(), dto.getIdProveedor(),
                null,                          // sin ubicación todavía
                ID_ESTADO_EN_REVISION
        );
        Lote lote = loteRepository.findByNumeroLote(dto.getNumeroLote())
                .orElseThrow(() -> new RuntimeException("Error al recuperar el lote pre-registrado: " + dto.getNumeroLote()));
        return LoteResponseDTO.from(lote);
    }

    @Override
    @Transactional
    public LoteResponseDTO validarLote(Integer idLote, LoteValidacionDTO dto) {
        Lote lote = loteRepository.findById(idLote)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado: " + idLote));

        UbicacionInterna ubicacion = ubicacionRepository.findById(dto.getIdUbicacion())
                .orElseThrow(() -> new EntityNotFoundException("Ubicación no encontrada: " + dto.getIdUbicacion()));

        // Actualizar el lote con la cantidad validada, ubicación y pasar a ACTIVO
        lote.setCantidadInicial(dto.getCantidadValidada());
        lote.setCantidadActual(dto.getCantidadValidada());
        lote.setUbicacion(ubicacion);
        lote.setIdEstadoLote(ID_ESTADO_ACTIVO);
        lote.setFechaIngreso(LocalDateTime.now());

        Lote guardado = loteRepository.save(lote);
        return LoteResponseDTO.from(guardado);
    }

    // ── Consultas ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarTodos() {
        return loteRepository.findAll().stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LoteResponseDTO buscarPorNumeroLote(String numeroLote) {
        return loteRepository.findByNumeroLote(numeroLote)
                .map(LoteResponseDTO::from)
                .orElseThrow(() -> new EntityNotFoundException("Lote no encontrado: " + numeroLote));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarLotesProximosAVencer(LocalDate fechaLimite, Integer idEstadoActivo) {
        return loteRepository.findLotesProximosAVencer(fechaLimite, idEstadoActivo)
                .stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarFEFO(Integer idEstadoActivo, Integer idProducto) {
        List<Lote> lotes = (idProducto != null)
                ? loteRepository.findByProductoFEFO(idProducto, idEstadoActivo)
                : loteRepository.findAllFEFO(idEstadoActivo);
        return lotes.stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarPendientesValidacion(Integer idEstadoPendiente) {
        return loteRepository.findLotesPendientesValidacion(idEstadoPendiente)
                .stream().map(LoteResponseDTO::from).toList();
    }

    @Override
    public void anularLote(Integer idLote) {
        loteRepository.anularLote(idLote);
    }
}
