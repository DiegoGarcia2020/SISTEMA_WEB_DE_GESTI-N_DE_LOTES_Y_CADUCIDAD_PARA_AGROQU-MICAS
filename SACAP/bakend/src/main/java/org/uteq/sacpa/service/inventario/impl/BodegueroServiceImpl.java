package org.uteq.sacpa.service.inventario.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.ia_alertas.AlertaCaducidadResponseDTO;
import org.uteq.sacpa.dto.inventario.LoteResponseDTO;
import org.uteq.sacpa.dto.inventario.MiBodegaDTO;
import org.uteq.sacpa.dto.inventario.NodoTopologiaDTO;
import org.uteq.sacpa.dto.operaciones.LoteDisponibleDTO;
import org.uteq.sacpa.dto.operaciones.OrdenPendienteDespachoDTO;
import org.uteq.sacpa.entity.inventario.Bodeguero;
import org.uteq.sacpa.repository.inventario.IBodegueroRepository;
import org.uteq.sacpa.service.ia_alertas.IAlertaCaducidadService;
import org.uteq.sacpa.service.inventario.IAlmacenService;
import org.uteq.sacpa.service.inventario.IBodegueroService;
import org.uteq.sacpa.service.inventario.ILoteService;
import org.uteq.sacpa.service.operaciones.IDespachoService;
import org.uteq.sacpa.service.operaciones.IMovimientoService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BodegueroServiceImpl implements IBodegueroService {

    private static final int ID_ESTADO_ALERTA_ACTIVA = 1;

    private final IBodegueroRepository bodegueroRepository;
    private final IMovimientoService movimientoService;
    private final IAlertaCaducidadService alertaService;
    private final IDespachoService despachoService;
    private final IAlmacenService almacenService;
    private final ILoteService loteService;

    @Override
    @Transactional(readOnly = true)
    public Optional<MiBodegaDTO> miBodega(Integer idUsuarioAutenticado) {
        return bodegueroRepository.findByUsuario_IdUsuario(idUsuarioAutenticado)
                .map(Bodeguero::getAlmacen)
                .filter(a -> a != null)
                .map(MiBodegaDTO::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Integer> resolverIdAlmacen(Integer idUsuarioAutenticado) {
        return bodegueroRepository.findByUsuario_IdUsuario(idUsuarioAutenticado)
                .map(Bodeguero::getAlmacen)
                .filter(a -> a != null)
                .map(org.uteq.sacpa.entity.inventario.Almacen::getIdAlmacen);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteDisponibleDTO> lotesDisponiblesFefo(Integer idUsuarioAutenticado) {
        return resolverIdAlmacen(idUsuarioAutenticado)
                .map(movimientoService::listarLotesDisponiblesFefoPorAlmacen)
                .orElseGet(List::of);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AlertaCaducidadResponseDTO> alertas(Integer idUsuarioAutenticado, Integer idEstadoActivo, Pageable pageable) {
        Integer estado = idEstadoActivo != null ? idEstadoActivo : ID_ESTADO_ALERTA_ACTIVA;
        return resolverIdAlmacen(idUsuarioAutenticado)
                .map(idAlmacen -> alertaService.listarAlertasActivasPorAlmacen(estado, idAlmacen, pageable))
                .orElseGet(() -> Page.empty(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenPendienteDespachoDTO> despachosPendientes(Integer idUsuarioAutenticado, String busqueda) {
        return resolverIdAlmacen(idUsuarioAutenticado)
                .map(idAlmacen -> despachoService.listarPendientesPrepararPorAlmacen(busqueda, idAlmacen))
                .orElseGet(List::of);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenPendienteDespachoDTO> despachosPendientesEntrega(Integer idUsuarioAutenticado, String busqueda) {
        return resolverIdAlmacen(idUsuarioAutenticado)
                .map(idAlmacen -> despachoService.listarListasParaEntregaPorAlmacen(busqueda, idAlmacen))
                .orElseGet(List::of);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NodoTopologiaDTO> arbolTopologia(Integer idUsuarioAutenticado) {
        return resolverIdAlmacen(idUsuarioAutenticado)
                .map(almacenService::obtenerArbolTopologiaPorAlmacen)
                .orElseGet(List::of);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> lotesPendientesDeUbicar(Integer idUsuarioAutenticado, Integer idEstadoPendiente) {
        return resolverIdAlmacen(idUsuarioAutenticado)
                .map(idAlmacen -> loteService.listarPendientesValidacionPorAlmacen(idEstadoPendiente, idAlmacen))
                .orElseGet(List::of);
    }
}
