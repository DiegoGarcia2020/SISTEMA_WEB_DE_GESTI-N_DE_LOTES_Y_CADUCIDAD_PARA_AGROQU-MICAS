package org.uteq.sacpa.service.operaciones;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.operaciones.TemporadaRequestDTO;
import org.uteq.sacpa.dto.operaciones.TemporadaResponseDTO;
import org.uteq.sacpa.entity.operaciones.Temporada;
import org.uteq.sacpa.repository.operaciones.ITemporadaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("temporadaServiceImplOperaciones")
@RequiredArgsConstructor
public class TemporadaServiceImpl implements ITemporadaService {

    private final ITemporadaRepository temporadaRepository;

    @Override
    @Transactional
    public TemporadaResponseDTO aperturarTemporada(TemporadaRequestDTO request) {
        // Buscar si existe una temporada activa
        Optional<Temporada> activaOpt = temporadaRepository.findByEstado("ACTIVO");
        
        if (activaOpt.isPresent()) {
            Temporada activa = activaOpt.get();
            activa.setEstado("INACTIVO");
            activa.setFechaFin(LocalDate.now());
            temporadaRepository.save(activa);
        }

        Temporada nuevaTemporada = Temporada.builder()
                .nombre(request.getNombre())
                .fechaInicio(request.getFechaInicio() != null ? request.getFechaInicio() : LocalDate.now())
                .estado("ACTIVO")
                .fechaCreacion(LocalDateTime.now())
                .build();
                
        nuevaTemporada = temporadaRepository.save(nuevaTemporada);
        
        return toResponseDTO(nuevaTemporada);
    }

    @Override
    @Transactional(readOnly = true)
    public TemporadaResponseDTO obtenerTemporadaActiva() {
        return temporadaRepository.findByEstado("ACTIVO")
                .map(this::toResponseDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TemporadaResponseDTO> listarTemporadas() {
        return temporadaRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }
    
    private TemporadaResponseDTO toResponseDTO(Temporada entity) {
        return TemporadaResponseDTO.builder()
                .idTemporada(entity.getIdTemporada())
                .nombre(entity.getNombre())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .estado(entity.getEstado())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
