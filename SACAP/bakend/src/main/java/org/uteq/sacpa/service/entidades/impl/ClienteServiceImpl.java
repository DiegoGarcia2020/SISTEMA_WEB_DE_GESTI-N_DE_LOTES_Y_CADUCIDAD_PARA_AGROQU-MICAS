package org.uteq.sacpa.service.entidades.impl;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.dto.entidades.ClienteResponseDTO;
import org.uteq.sacpa.repository.entidades.IClienteRepository;
import org.uteq.sacpa.service.entidades.IClienteService;

import java.sql.PreparedStatement;
import java.sql.Types;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements IClienteService {

    private static final int ID_ESTADO_ACTIVO = 1;

    private final IClienteRepository clienteRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public ClienteResponseDTO crearCliente(ClienteRequestDTO dto) {
        Integer idEstado = dto.getIdEstado() != null ? dto.getIdEstado() : ID_ESTADO_ACTIVO;
        // Vía JdbcTemplate: llamar "SELECT fn(...)" con executeUpdate() (usado por @Modifying)
        // falla en Postgres para funciones que retornan void — ver LoteServiceImpl.preRegistrarLote.
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT entidades.fn_crear_cliente(?, ?, ?, ?, ?)")) {
                ps.setString(1, dto.getNombre());
                setNullableString(ps, 2, dto.getCedulaRuc());
                setNullableString(ps, 3, dto.getTelefono());
                setNullableString(ps, 4, dto.getUbicacionFinca());
                ps.setInt(5, idEstado);
                ps.execute();
            }
            return null;
        });
        return ClienteResponseDTO.from(clienteRepository.findTopByOrderByIdClienteDesc());
    }

    @Override
    @Transactional
    public ClienteResponseDTO actualizarCliente(Integer idCliente, ClienteRequestDTO dto) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT entidades.fn_actualizar_cliente(?, ?, ?, ?, ?, ?)")) {
                ps.setInt(1, idCliente);
                ps.setString(2, dto.getNombre());
                setNullableString(ps, 3, dto.getCedulaRuc());
                setNullableString(ps, 4, dto.getTelefono());
                setNullableString(ps, 5, dto.getUbicacionFinca());
                if (dto.getIdEstado() != null) ps.setInt(6, dto.getIdEstado()); else ps.setNull(6, Types.INTEGER);
                ps.execute();
            }
            return null;
        });
        return clienteRepository.findById(idCliente).map(ClienteResponseDTO::from)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado: " + idCliente));

    }

    @Override
    @Transactional(readOnly = true)

    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll().stream().map(ClienteResponseDTO::from).toList();

    }

    @Override
    @Transactional(readOnly = true)

    public List<ClienteResponseDTO> buscar(String nombre) {
        return clienteRepository.findByNombreContainingIgnoreCase(nombre).stream().map(ClienteResponseDTO::from).toList();
    }

    @Override
    @Transactional
    public void desactivarCliente(Integer idCliente, Integer idEstadoInactivo) {
        jdbcTemplate.execute((java.sql.Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement("SELECT entidades.fn_desactivar_cliente(?, ?)")) {
                ps.setInt(1, idCliente);
                ps.setInt(2, idEstadoInactivo);
                ps.execute();
            }
            return null;
        });
    }

    private void setNullableString(PreparedStatement ps, int idx, String value) throws java.sql.SQLException {
        if (value != null) ps.setString(idx, value); else ps.setNull(idx, Types.VARCHAR);

    }
}
