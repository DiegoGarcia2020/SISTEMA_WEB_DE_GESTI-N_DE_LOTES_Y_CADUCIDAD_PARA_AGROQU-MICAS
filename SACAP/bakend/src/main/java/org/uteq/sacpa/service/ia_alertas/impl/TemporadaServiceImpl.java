package org.uteq.sacpa.service.ia_alertas.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_modelos.TemporadaRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.TemporadaResponseDTO;
import org.uteq.sacpa.entity.catalogos.CatEstadoTemporada;
import org.uteq.sacpa.entity.ia_alertas.TemporadaAgricola;
import org.uteq.sacpa.repository.catalogos.ICatEstadoTemporadaRepository;
import org.uteq.sacpa.repository.ia_alertas.ITemporadaAgricolaRepository;
import org.uteq.sacpa.service.ia_alertas.ITemporadaService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Date;
import java.util.List;


@Service("temporadaServiceImplIA")

public class TemporadaServiceImpl implements ITemporadaService {

    private final ITemporadaAgricolaRepository temporadaRepository;
    private final ICatEstadoTemporadaRepository catEstadoTemporadaRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public TemporadaResponseDTO crearTemporada(TemporadaRequestDTO dto) {
        Integer idEstado = resolverIdEstado(dto.getEstado() != null ? dto.getEstado() : "PLANIFICADA");
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_temporada_agricola(?, ?, ?, ?, ?)")) {
                ps.setString(1, dto.getNombre());
                ps.setString(2, dto.getCultivo());
                ps.setDate(3, Date.valueOf(dto.getFechaInicio()));
                ps.setDate(4, Date.valueOf(dto.getFechaFinProyectada()));
                ps.setInt(5, idEstado);
                ps.execute();
            }
            return null;
        });
        TemporadaAgricola creada = temporadaRepository.findTopByOrderByIdTemporadaDesc();
        return TemporadaResponseDTO.from(creada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TemporadaResponseDTO> listarTodas() {
        return temporadaRepository.findAll().stream().map(TemporadaResponseDTO::from).toList();
    }

    @Override
    @Transactional
    public void cambiarEstado(Integer idTemporada, String estado) {
        TemporadaAgricola t = temporadaRepository.findById(idTemporada)
                .orElseThrow(() -> new EntityNotFoundException("Temporada no encontrada: " + idTemporada));
        Integer idEstado = resolverIdEstado(estado);
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_actualizar_temporada_agricola(?, ?, ?, ?, ?, ?)")) {
                ps.setInt(1, idTemporada);
                ps.setString(2, t.getNombreTemporada());
                ps.setString(3, t.getCultivo());
                ps.setDate(4, Date.valueOf(t.getFechaInicio()));
                ps.setDate(5, Date.valueOf(t.getFechaFin()));
                ps.setInt(6, idEstado);
                ps.execute();
            }
            return null;
        });
    }

    private Integer resolverIdEstado(String nombreEstado) {
        return catEstadoTemporadaRepository.findByNombreIgnoreCase(nombreEstado)
                .map(CatEstadoTemporada::getIdEstadoTemporada)
                .orElseThrow(() -> new IllegalArgumentException("Estado de temporada desconocido: " + nombreEstado));
    }
}
