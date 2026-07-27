package org.uteq.sacpa.service.ia_alertas.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_modelos.SugerenciaRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.SugerenciaIA;
import org.uteq.sacpa.repository.ia_alertas.ISugerenciaIARepository;
import org.uteq.sacpa.service.ia_alertas.ISugerenciaIAService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SugerenciaIAServiceImpl implements ISugerenciaIAService {

    private final ISugerenciaIARepository sugerenciaRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void crearSugerencia(SugerenciaRequestDTO dto) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_sugerencia_ia(?, ?, ?, ?, ?, ?)")) {
                ps.setBigDecimal(1, dto.getPorcentajeDescuento());
                ps.setString(2, dto.getObservaciones());
                ps.setInt(3, dto.getIdLote());
                ps.setInt(4, dto.getIdTemporada());
                ps.setInt(5, dto.getIdEjecucion());
                ps.setInt(6, dto.getIdEstadoAprobacion());
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<SugerenciaIA> buscarPorLote(Integer idLote) {
        return sugerenciaRepository.findByLote_IdLote(idLote);
    }

    @Override
    @Transactional
    public void actualizarEstadoSugerencia(Integer idSugerencia, Integer idEstadoAprobacion) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_actualizar_estado_sugerencia_ia(?, ?)")) {
                ps.setInt(1, idSugerencia);
                ps.setInt(2, idEstadoAprobacion);
                ps.execute();
            }
            return null;
        });
    }
}
