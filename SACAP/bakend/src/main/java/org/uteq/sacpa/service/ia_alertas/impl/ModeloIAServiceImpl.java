package org.uteq.sacpa.service.ia_alertas.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_modelos.ModeloIARequestDTO;
import org.uteq.sacpa.entity.ia_alertas.ModeloIA;
import org.uteq.sacpa.repository.ia_alertas.IModeloIARepository;
import org.uteq.sacpa.service.ia_alertas.IModeloIAService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModeloIAServiceImpl implements IModeloIAService {

    private final IModeloIARepository modeloRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void crearModelo(ModeloIARequestDTO dto) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT ia_alertas.fn_crear_modelo_ia(?, ?, ?)")) {
                ps.setString(1, dto.getNombreModelo());
                ps.setString(2, dto.getVersion());
                ps.setString(3, dto.getDescripcion());
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModeloIA> listarTodos() {
        return modeloRepository.findAll();
    }

    @Override
    @Transactional
    public void desactivarModelo(Integer idModelo, Integer idEstadoInactivo) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT ia_alertas.fn_desactivar_modelo_ia(?)")) {
                ps.setInt(1, idModelo);
                ps.execute();
            }
            return null;
        });
    }
}
