package org.uteq.sacpa.service.ia_alertas.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_modelos.PromocionRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;
import org.uteq.sacpa.entity.catalogos.CatEstadoPromocion;
import org.uteq.sacpa.entity.ia_alertas.Promocion;
import org.uteq.sacpa.repository.catalogos.ICatEstadoPromocionRepository;
import org.uteq.sacpa.repository.ia_alertas.IPromocionRepository;
import org.uteq.sacpa.service.ia_alertas.IPromocionService;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromocionServiceImpl implements IPromocionService {

    private final IPromocionRepository promocionRepository;
    private final ICatEstadoPromocionRepository catEstadoPromocionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public PromocionResponseDTO crearPromocion(PromocionRequestDTO dto, Integer idUsuarioAprueba) {
        crearPromocionJdbc(dto.getNombre(), dto.getDescripcion(), dto.getPorcentajeDescuento(),
                dto.getFechaInicio(), dto.getFechaFin(), null, idUsuarioAprueba, dto.getIdEstado());
        return PromocionResponseDTO.from(promocionRepository.findTopByOrderByIdPromocionDesc());
    }

    @Override
    @Transactional
    public PromocionResponseDTO crearDesdeSugerencia(Integer idSugerencia, String nombre, String descripcion,
                                                       BigDecimal descuentoGlobal, LocalDate fechaInicio, LocalDate fechaFin,
                                                       Integer idUsuarioAprueba) {
        Integer idSugerida = resolverIdEstado("SUGERIDA");
        crearPromocionJdbc(nombre, descripcion, descuentoGlobal, fechaInicio, fechaFin, idSugerencia, idUsuarioAprueba, idSugerida);
        return PromocionResponseDTO.from(promocionRepository.findTopByOrderByIdPromocionDesc());
    }

    @Override

    @Transactional(readOnly = true)
    public List<PromocionResponseDTO> listarTodas() {
        return promocionRepository.findAll().stream().map(PromocionResponseDTO::from).toList();
    }

    @Override
    @Transactional
    public void cambiarEstado(Integer idPromocion, String estado) {
        Promocion p = promocionRepository.findById(idPromocion)
                .orElseThrow(() -> new EntityNotFoundException("Promoción no encontrada: " + idPromocion));
        Integer idEstado = resolverIdEstado(estado);
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_actualizar_promocion(?, ?, ?, ?, ?, ?, ?)")) {
                ps.setInt(1, idPromocion);
                ps.setString(2, p.getNombrePromocion());
                ps.setString(3, p.getDescripcion());
                ps.setBigDecimal(4, p.getDescuentoGlobal());
                ps.setDate(5, Date.valueOf(p.getFechaInicio()));
                ps.setDate(6, Date.valueOf(p.getFechaFin()));
                ps.setInt(7, idEstado);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @Transactional

    public void desactivarPromocion(Integer idPromocion, Integer idEstadoInactivo) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT ia_alertas.fn_desactivar_promocion(?, ?)")) {
                ps.setInt(1, idPromocion);
                ps.setInt(2, idEstadoInactivo);
                ps.execute();
            }
            return null;
        });
    }

    private void crearPromocionJdbc(String nombre, String descripcion, BigDecimal descuentoGlobal,
                                     LocalDate fechaInicio, LocalDate fechaFin,
                                     Integer idSugerencia, Integer idUsuarioAprueba, Integer idEstado) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT ia_alertas.fn_crear_promocion(?, ?, ?, ?, ?, ?, ?, ?)")) {
                ps.setString(1, nombre);
                ps.setString(2, descripcion);
                ps.setBigDecimal(3, descuentoGlobal);
                ps.setDate(4, Date.valueOf(fechaInicio));
                ps.setDate(5, Date.valueOf(fechaFin));
                if (idSugerencia != null) ps.setInt(6, idSugerencia); else ps.setNull(6, Types.INTEGER);
                if (idUsuarioAprueba != null) ps.setInt(7, idUsuarioAprueba); else ps.setNull(7, Types.INTEGER);
                ps.setInt(8, idEstado);
                ps.execute();
            }
            return null;
        });
    }

    private Integer resolverIdEstado(String nombreEstado) {
        return catEstadoPromocionRepository.findByNombreIgnoreCase(nombreEstado)
                .map(CatEstadoPromocion::getIdEstadoPromocion)
                .orElseThrow(() -> new IllegalArgumentException("Estado de promoción desconocido: " + nombreEstado));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void cambiarEstadoPromocion(Integer idPromocion, Integer idEstado) {
        Promocion prom = promocionRepository.findById(idPromocion)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada con ID: " + idPromocion));
        prom.setIdEstado(idEstado);
        promocionRepository.save(prom);
    }
}
