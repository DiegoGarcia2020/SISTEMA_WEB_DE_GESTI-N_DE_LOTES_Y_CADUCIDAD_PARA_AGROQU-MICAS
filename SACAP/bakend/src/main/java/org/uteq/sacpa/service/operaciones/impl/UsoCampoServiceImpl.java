package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.UsoCampoRequestDTO;
import org.uteq.sacpa.entity.operaciones.UsoCampo;
import org.uteq.sacpa.repository.operaciones.IUsoCampoRepository;
import org.uteq.sacpa.service.operaciones.IUsoCampoService;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Types;
import java.time.LocalDate;
import java.util.List;

@Service
public class UsoCampoServiceImpl implements IUsoCampoService {

    @Autowired
    private IUsoCampoRepository usoCampoRepository;

    @Autowired
    private org.uteq.sacpa.repository.inventario.ILoteRepository loteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void crearUsoCampo(UsoCampoRequestDTO dto) {
        org.uteq.sacpa.entity.inventario.Lote lote = loteRepository.findById(dto.getIdLote())
                .orElseThrow(() -> new RuntimeException("Lote no encontrado con ID: " + dto.getIdLote()));

        if (lote.getCantidadActual() == null || lote.getCantidadActual() < dto.getCantidadUsada()) {
            throw new RuntimeException("El lote seleccionado no tiene suficiente stock disponible (" + (lote.getCantidadActual() == null ? 0 : lote.getCantidadActual()) + " unidades).");
        }

        String parcela = dto.getCultivoParcela() != null ? dto.getCultivoParcela() : "Parcela General";
        String cultivo = dto.getCultivoParcela() != null ? dto.getCultivoParcela() : "Cultivo Varios";
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT operaciones.fn_crear_uso_campo(?, ?, ?, ?, ?, ?, ?)")) {
                ps.setString(1, parcela);
                ps.setString(2, cultivo);
                ps.setDate(3, Date.valueOf(dto.getFechaUso()));
                ps.setInt(4, dto.getCantidadUsada());
                ps.setString(5, dto.getObservaciones());
                ps.setInt(6, dto.getIdLote());
                ps.setInt(7, dto.getIdTecnicoCampo());
                ps.execute();
            }
            return null;
        });

        int nuevoStock = lote.getCantidadActual() - dto.getCantidadUsada();
        lote.setCantidadActual(nuevoStock);
        loteRepository.save(lote);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<UsoCampo> buscarPorLote(Integer idLote) {
        return usoCampoRepository.findByLote_IdLote(idLote);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void anularUsoCampo(Integer idUsoCampo, Integer idEstadoAnulado) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT operaciones.fn_anular_uso_campo(?)")) {
                ps.setInt(1, idUsoCampo);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<UsoCampo> listarTodos() {
        return usoCampoRepository.findAll();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<UsoCampo> listarFiltrado(LocalDate fechaInicio, LocalDate fechaFin, String cultivo) {
        return usoCampoRepository.findAll().stream()
                .filter(u -> {
                    boolean matchInicio = fechaInicio == null || (u.getFechaAplicacion() != null && !u.getFechaAplicacion().isBefore(fechaInicio));
                    boolean matchFin = fechaFin == null || (u.getFechaAplicacion() != null && !u.getFechaAplicacion().isAfter(fechaFin));
                    boolean matchCultivo = cultivo == null || cultivo.trim().isEmpty() || 
                            (u.getCultivo() != null && u.getCultivo().toLowerCase().contains(cultivo.toLowerCase())) ||
                            (u.getParcela() != null && u.getParcela().toLowerCase().contains(cultivo.toLowerCase()));
                    return matchInicio && matchFin && matchCultivo;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    // ── Orden de Pedido (Ventas) ──────────────────────────────────────────

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void crearOrdenPedido(org.uteq.sacpa.dto.operaciones.OrdenPedidoRequestDTO dto) {
        org.uteq.sacpa.entity.inventario.Lote lote = loteRepository.findById(dto.getIdLote())
                .orElseThrow(() -> new RuntimeException("Lote no encontrado con ID: " + dto.getIdLote()));

        int stockDisponible = (lote.getCantidadActual() != null ? lote.getCantidadActual() : 0)
                - (lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0);

        if (stockDisponible < dto.getCantidad()) {
            throw new RuntimeException("El lote seleccionado no tiene suficiente stock disponible (" + stockDisponible + " unidades disponibles tras reservas).");
        }

        String observacion = dto.getObservacion() != null ? dto.getObservacion() : "Pedido generado por Técnico-Comercial";
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT operaciones.fn_crear_orden_pedido(?, ?, ?, ?, ?, ?, ?)")) {
                ps.setInt(1, dto.getIdCliente());
                ps.setString(2, dto.getDescripcionPlaga());
                ps.setInt(3, dto.getIdLote());
                ps.setInt(4, dto.getCantidad());
                ps.setString(5, observacion);
                ps.setInt(6, dto.getIdTecnico());
                if (dto.getIdComboAplicado() != null) ps.setInt(7, dto.getIdComboAplicado());
                else ps.setNull(7, Types.INTEGER);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<org.uteq.sacpa.dto.operaciones.PedidoResponseDTO> listarPedidosPorTecnico(Integer idTecnico) {
        return usoCampoRepository.findByTecnico_IdUsuarioAndTipoRegistro(idTecnico, "ORDEN_PEDIDO")
                .stream().map(org.uteq.sacpa.dto.operaciones.PedidoResponseDTO::from).toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<org.uteq.sacpa.dto.operaciones.PedidoResponseDTO> listarPedidosPendientesBodega() {
        return usoCampoRepository.findByTipoRegistroAndIdEstadoPedido("ORDEN_PEDIDO", 1)
                .stream().map(org.uteq.sacpa.dto.operaciones.PedidoResponseDTO::from).toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void despacharPedido(Integer idOrden, Integer idUsuarioBodeguero) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT operaciones.fn_despachar_pedido(?, ?)")) {
                ps.setInt(1, idOrden);
                ps.setInt(2, idUsuarioBodeguero);
                ps.execute();
            }
            return null;
        });
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void registrarDevolucionCliente(Integer idPedidoOriginal, String motivo,
                                           Integer cantidad, Integer idLote, Integer idUsuario) {
        jdbcTemplate.execute((Connection conn) -> {
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT operaciones.fn_devolucion_cliente(?, ?, ?, ?, ?)")) {
                if (idPedidoOriginal != null) ps.setInt(1, idPedidoOriginal);
                else ps.setNull(1, Types.INTEGER);
                ps.setString(2, motivo);
                ps.setInt(3, cantidad);
                ps.setInt(4, idLote);
                ps.setInt(5, idUsuario);
                ps.execute();
            }
            return null;
        });
    }
}

