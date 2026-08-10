package org.uteq.sacpa.service.operaciones.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.operaciones.MovimientoRequestDTO;
import org.uteq.sacpa.entity.operaciones.MovimientoInventario;
import org.uteq.sacpa.repository.operaciones.IMovimientoInventarioRepository;
import org.uteq.sacpa.service.operaciones.IMovimientoService;

import java.util.List;
import java.util.stream.Collectors;
import org.uteq.sacpa.util.TipoMovimiento;
import org.uteq.sacpa.util.EstadoAprobacion;
import org.uteq.sacpa.dto.operaciones.MovimientoResumenDTO;

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
        List<org.uteq.sacpa.entity.inventario.Lote> lotes = loteRepository.findByProductoForUpdate(dto.getIdProducto());
        int cantidadRestante = dto.getCantidad();

        for (org.uteq.sacpa.entity.inventario.Lote lote : lotes) {
            if (cantidadRestante <= 0) break;
            
            int actual = lote.getCantidadActual() != null ? lote.getCantidadActual() : 0;
            int reservada = lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0;
            int disponible = actual - reservada;
            
            if (disponible > 0) {
                int cantidadTomar = Math.min(cantidadRestante, disponible);
                
                // Reservar cantidad
                lote.setCantidadReservada(reservada + cantidadTomar);
                loteRepository.save(lote);
                
                movimientoRepository.crearMovimiento(
                        cantidadTomar,
                        dto.getObservacion() != null ? dto.getObservacion() : "Despacho FEFO automático por Bodeguero",
                        lote.getIdLote(),
                        TipoMovimiento.SALIDA,
                        dto.getIdUsuario(),
                        EstadoAprobacion.PENDIENTE
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
    public List<MovimientoResumenDTO> listarPendientes() {
        return movimientoRepository.findTop50ByIdEstadoAprobacionOrderByFechaMovimientoDesc(EstadoAprobacion.PENDIENTE)
                .stream()
                .map(MovimientoResumenDTO::from)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<MovimientoResumenDTO> listarTodos() {
        return movimientoRepository.findTop50ByOrderByFechaMovimientoDesc()
                .stream()
                .map(MovimientoResumenDTO::from)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void aprobarDespacho(Integer idMovimiento, String observacion) {
        MovimientoInventario mov = movimientoRepository.findById(idMovimiento)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado con ID: " + idMovimiento));

        movimientoRepository.actualizarMovimiento(idMovimiento, observacion != null ? observacion : "Aprobado por el Supervisor", EstadoAprobacion.APROBADO);

        // Restar del stock real del lote al aprobarse la salida y liberar reserva
        if (mov.getLote() != null && mov.getCantidad() != null) {
            org.uteq.sacpa.entity.inventario.Lote lote = mov.getLote();
            int actual = lote.getCantidadActual() != null ? lote.getCantidadActual() : 0;
            int reservada = lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0;
            
            int nuevoStock = Math.max(0, actual - mov.getCantidad());
            int nuevaReserva = Math.max(0, reservada - mov.getCantidad());
            
            lote.setCantidadActual(nuevoStock);
            lote.setCantidadReservada(nuevaReserva);
            loteRepository.save(lote);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void rechazarDespacho(Integer idMovimiento, String observacion) {
        MovimientoInventario mov = movimientoRepository.findById(idMovimiento)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado con ID: " + idMovimiento));
                
        movimientoRepository.actualizarMovimiento(idMovimiento, observacion != null ? observacion : "Rechazado por el Supervisor", EstadoAprobacion.RECHAZADO);
        
        // Liberar reserva sin tocar cantidad actual
        if (mov.getLote() != null && mov.getCantidad() != null) {
            org.uteq.sacpa.entity.inventario.Lote lote = mov.getLote();
            int reservada = lote.getCantidadReservada() != null ? lote.getCantidadReservada() : 0;
            int nuevaReserva = Math.max(0, reservada - mov.getCantidad());
            lote.setCantidadReservada(nuevaReserva);
            loteRepository.save(lote);
        }
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
                        .nombreProveedor(l.getProveedor() != null ? l.getProveedor().getNombreRepresentante() : "N/A")
                        .ubicacionAlmacen(l.getUbicacion() != null ? "Est. " + (l.getUbicacion().getEstanteria() != null ? l.getUbicacion().getEstanteria().getCodigo() : "N/A") + " - Nivel " + l.getUbicacion().getNivel() + " (" + l.getUbicacion().getPosicion() + ")" : "Bodega General")
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
