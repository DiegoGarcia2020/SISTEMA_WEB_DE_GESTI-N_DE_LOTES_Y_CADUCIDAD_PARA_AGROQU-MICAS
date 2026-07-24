package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.MovimientoRequestDTO;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;
import org.uteq.sacpa.repository.operaciones.IMovimientoInventarioRepository;
import org.uteq.sacpa.service.operaciones.IMovimientoService;

import java.util.List;

@Service
public class MovimientoServiceImpl implements IMovimientoService {

    @Autowired
    private IMovimientoInventarioRepository movimientoRepository;

    @Autowired
    private org.uteq.sacpa.repository.inventario.ILoteRepository loteRepository;

    @Override
    public void crearMovimiento(MovimientoRequestDTO dto) {
        movimientoRepository.crearMovimiento(
                dto.getCantidad(),
                dto.getObservacion(),
                dto.getIdLote(),
                dto.getIdTipoMovimiento(),
                dto.getIdUsuario(),
                dto.getIdEstadoAprobacion()
        );
    }

    @Override
    public List<MovimientoInventario> buscarPorLote(Integer idLote) {
        return movimientoRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void anularMovimiento(Integer idMovimiento, Integer idEstadoAnulado) {
        movimientoRepository.anularMovimiento(idMovimiento, idEstadoAnulado);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void despacharFefo(org.uteq.sacpa.dto.operaciones.DespachoRequestDTO dto) {
        List<org.uteq.sacpa.entity.inventario.Lote> lotes = loteRepository.findByProducto(dto.getIdProducto());
        int cantidadRestante = dto.getCantidad();

        for (org.uteq.sacpa.entity.inventario.Lote lote : lotes) {
            if (cantidadRestante <= 0) break;
            if (lote.getCantidadActual() != null && lote.getCantidadActual() > 0) {
                int cantidadTomar = Math.min(cantidadRestante, lote.getCantidadActual());
                movimientoRepository.crearMovimiento(
                        cantidadTomar,
                        dto.getObservacion() != null ? dto.getObservacion() : "Despacho FEFO automático por Bodeguero",
                        lote.getIdLote(),
                        2, // 2: Salida / Despacho
                        dto.getIdUsuario(),
                        2  // 2: Pendiente de Aprobación por el Supervisor
                );
                cantidadRestante -= cantidadTomar;
            }
        }

        if (cantidadRestante > 0) {
            throw new RuntimeException("No hay suficiente stock en los lotes disponibles para cubrir la cantidad solicitada. Faltaron: " + cantidadRestante + " unidades.");
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<MovimientoInventario> listarPendientes() {
        return movimientoRepository.findAll().stream()
                .filter(m -> m.getIdEstadoAprobacion() != null && m.getIdEstadoAprobacion() == 2)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<MovimientoInventario> listarTodos() {
        return movimientoRepository.findAll();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void aprobarDespacho(Integer idMovimiento, String observacion) {
        MovimientoInventario mov = movimientoRepository.findById(idMovimiento)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado con ID: " + idMovimiento));

        movimientoRepository.actualizarMovimiento(idMovimiento, observacion != null ? observacion : "Aprobado por el Supervisor", 1); // 1: Aprobado

        // Restar del stock real del lote al aprobarse la salida
        if (mov.getLote() != null && mov.getCantidad() != null) {
            org.uteq.sacpa.entity.inventario.Lote lote = mov.getLote();
            int nuevoStock = Math.max(0, (lote.getCantidadActual() != null ? lote.getCantidadActual() : 0) - mov.getCantidad());
            lote.setCantidadActual(nuevoStock);
            loteRepository.save(lote);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void rechazarDespacho(Integer idMovimiento, String observacion) {
        movimientoRepository.actualizarMovimiento(idMovimiento, observacion != null ? observacion : "Rechazado por el Supervisor", 3); // 3: Rechazado
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO> listarLotesDisponiblesFefo() {
        return loteRepository.findLotesDisponiblesFefo().stream()
                .map(l -> org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO.builder()
                        .idLote(l.getIdLote())
                        .numeroLote(l.getNumeroLote())
                        .idProducto(l.getProducto() != null ? l.getProducto().getIdProducto() : null)
                        .nombreProducto(l.getProducto() != null ? l.getProducto().getNombre() : "Producto Desconocido")
                        .cantidadActual(l.getCantidadActual())
                        .fechaVencimiento(l.getFechaVencimiento())
                        .nombreProveedor(l.getProveedor() != null ? l.getProveedor().getNombre() : "N/A")
                        .ubicacionAlmacen(l.getUbicacion() != null ? "Est. " + (l.getUbicacion().getEstanteria() != null ? l.getUbicacion().getEstanteria().getCodigo() : "N/A") + " - Nivel " + l.getUbicacion().getNivel() + " (" + l.getUbicacion().getPosicion() + ")" : "Bodega General")
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
