package org.uteq.sacpa.service.ia_alertas.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_modelos.ReglaNegocioIARequestDTO;
import org.uteq.sacpa.dto.ia_modelos.ReglaNegocioIAResponseDTO;
import org.uteq.sacpa.entity.ia_alertas.ReglaNegocioIA;
import org.uteq.sacpa.repository.ia_alertas.IReglaNegocioIARepository;
import org.uteq.sacpa.service.ia_alertas.IReglaNegocioIAService;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;

@Service
@RequiredArgsConstructor
public class ReglaNegocioIAServiceImpl implements IReglaNegocioIAService {

    private final IReglaNegocioIARepository reglaRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public ReglaNegocioIAResponseDTO obtenerRegla() {
        return ReglaNegocioIAResponseDTO.from(obtenerOCrearRegla());
    }

    @Override
    @Transactional
    public ReglaNegocioIAResponseDTO actualizarRegla(ReglaNegocioIARequestDTO dto) {
        ReglaNegocioIA regla = obtenerOCrearRegla();
        actualizarReglaJdbc(regla.getIdRegla(), dto.getDescuentoMaximo(), dto.getActivarPromociones());
        regla = reglaRepository.findById(regla.getIdRegla())
                .orElseThrow(() -> new IllegalStateException("La regla de negocio IA desapareció durante la actualización"));
        regla.setDiasAlertaAnticipada(dto.getDiasAlertaAnticipada());
        regla = reglaRepository.save(regla);
        return ReglaNegocioIAResponseDTO.from(regla);
    }

    private ReglaNegocioIA obtenerOCrearRegla() {
        return reglaRepository.findByActivoTrue().stream().findFirst()
                .orElseGet(() -> {
                    crearReglaJdbc(new BigDecimal("35.00"), true);
                    ReglaNegocioIA creada = reglaRepository.findTopByOrderByIdReglaDesc();
                    creada.setDiasAlertaAnticipada(60);
                    return reglaRepository.save(creada);
                });
    }

    private void crearReglaJdbc(BigDecimal descuentoMaximo, Boolean activarPromociones) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_regla_negocio_ia(?, ?)")) {
                ps.setBigDecimal(1, descuentoMaximo);
                ps.setBoolean(2, Boolean.TRUE.equals(activarPromociones));
                ps.execute();
            }
            return null;
        });
    }

    private void actualizarReglaJdbc(Integer idRegla, BigDecimal descuentoMaximo, Boolean activarPromociones) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_actualizar_regla_negocio_ia(?, ?, ?)")) {
                ps.setInt(1, idRegla);
                ps.setBigDecimal(2, descuentoMaximo);
                ps.setBoolean(3, Boolean.TRUE.equals(activarPromociones));
                ps.execute();
            }
            return null;
        });
    }
}
