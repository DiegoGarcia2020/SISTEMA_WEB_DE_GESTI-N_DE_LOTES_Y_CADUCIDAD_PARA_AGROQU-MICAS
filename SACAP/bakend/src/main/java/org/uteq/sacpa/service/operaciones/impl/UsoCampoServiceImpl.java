package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.UsoCampoRequestDTO;
import org.uteq.sacpa.entity.operaciones.UsoCampo;
import org.uteq.sacpa.repository.operaciones.IUsoCampoRepository;
import org.uteq.sacpa.service.operaciones.IUsoCampoService;

import java.time.LocalDate;
import java.util.List;

@Service
public class UsoCampoServiceImpl implements IUsoCampoService {

    @Autowired
    private IUsoCampoRepository usoCampoRepository;

    @Autowired
    private org.uteq.sacpa.repository.inventario.ILoteRepository loteRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void crearUsoCampo(UsoCampoRequestDTO dto) {
        org.uteq.sacpa.entity.inventario.Lote lote = loteRepository.findById(dto.getIdLote())
                .orElseThrow(() -> new RuntimeException("Lote no encontrado con ID: " + dto.getIdLote()));

        if (lote.getCantidadActual() == null || lote.getCantidadActual() < dto.getCantidadUsada()) {
            throw new RuntimeException("El lote seleccionado no tiene suficiente stock disponible (" + (lote.getCantidadActual() == null ? 0 : lote.getCantidadActual()) + " unidades).");
        }

        usoCampoRepository.crearUsoCampo(
                dto.getCultivoParcela() != null ? dto.getCultivoParcela() : "Parcela General",
                dto.getCultivoParcela() != null ? dto.getCultivoParcela() : "Cultivo Varios",
                dto.getFechaUso(),
                dto.getCantidadUsada(),
                dto.getObservaciones(),
                dto.getIdLote(),
                dto.getIdTecnicoCampo()
        );

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
        usoCampoRepository.anularUsoCampo(idUsoCampo);
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

        usoCampoRepository.crearOrdenPedido(
                dto.getIdCliente(),
                dto.getDescripcionPlaga(),
                dto.getIdLote(),
                dto.getCantidad(),
                dto.getObservacion() != null ? dto.getObservacion() : "Pedido generado por Técnico-Comercial",
                dto.getIdTecnico(),
                dto.getIdComboAplicado()
        );
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<UsoCampo> listarPedidosPorTecnico(Integer idTecnico) {
        return usoCampoRepository.findByTecnico_IdUsuarioAndTipoRegistro(idTecnico, "ORDEN_PEDIDO");
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<UsoCampo> listarPedidosPendientesBodega() {
        return usoCampoRepository.findByTipoRegistroAndIdEstadoPedido("ORDEN_PEDIDO", 1);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void despacharPedido(Integer idOrden, Integer idUsuarioBodeguero) {
        usoCampoRepository.despacharPedido(idOrden, idUsuarioBodeguero);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void registrarDevolucionCliente(Integer idPedidoOriginal, String motivo,
                                           Integer cantidad, Integer idLote, Integer idUsuario) {
        usoCampoRepository.devolucionCliente(idPedidoOriginal, motivo, cantidad, idLote, idUsuario);
    }
}

