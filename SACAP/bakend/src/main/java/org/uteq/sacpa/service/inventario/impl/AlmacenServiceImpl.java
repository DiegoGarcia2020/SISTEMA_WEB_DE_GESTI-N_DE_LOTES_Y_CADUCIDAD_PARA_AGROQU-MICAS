package org.uteq.sacpa.service.inventario.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;
import org.uteq.sacpa.dto.inventario.*;
import org.uteq.sacpa.entity.geografia.Ciudad;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.entity.inventario.Estanteria;
import org.uteq.sacpa.entity.inventario.Supervisor;
import org.uteq.sacpa.entity.inventario.UbicacionInterna;
import org.uteq.sacpa.entity.inventario.ZonaAlmacen;
import org.uteq.sacpa.repository.geografia.ICiudadRepository;
import org.uteq.sacpa.repository.inventario.IAlmacenRepository;
import org.uteq.sacpa.repository.inventario.IEstanteriaRepository;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.repository.inventario.ISupervisorRepository;
import org.uteq.sacpa.repository.inventario.IUbicacionInternaRepository;
import org.uteq.sacpa.repository.inventario.IZonaAlmacenRepository;
import org.uteq.sacpa.service.inventario.IAlmacenService;
import org.uteq.sacpa.service.inventario.IQrService;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlmacenServiceImpl implements IAlmacenService {

    private final IAlmacenRepository          almacenRepository;
    private final IZonaAlmacenRepository      zonaRepository;
    private final IEstanteriaRepository       estanteriaRepository;
    private final IUbicacionInternaRepository  ubicacionRepository;
    private final ILoteRepository             loteRepository;
    private final IQrService                  qrService;
    private final ICiudadRepository           ciudadRepository;
    private final ISupervisorRepository       supervisorRepository;

    /**
     * Crea una bodega nueva (configuración global del Administrador).
     * El supervisor es opcional en este punto: puede asignarse aquí mismo o luego
     * con {@link #actualizarAlmacen}.
     */
    @Override
    @Transactional
    public void crearAlmacen(AlmacenRequestDTO dto) {
        Ciudad ciudad = ciudadRepository.findById(dto.getIdCiudad())
                .orElseThrow(() -> new EntityNotFoundException("Ciudad no encontrada: " + dto.getIdCiudad()));

        Supervisor supervisor = null;
        if (dto.getIdSupervisor() != null) {
            supervisor = supervisorRepository.findById(dto.getIdSupervisor())
                    .orElseThrow(() -> new EntityNotFoundException("Supervisor no encontrado: " + dto.getIdSupervisor()));
        }

        Almacen almacen = Almacen.builder()
                .nombre(dto.getNombre())
                .direccion(dto.getDireccion())
                .capacidadTotal(dto.getCapacidadMaxima())
                .idEstado(dto.getIdEstado() != null ? dto.getIdEstado() : 1)
                .ciudad(ciudad)
                .supervisor(supervisor)
                .build();

        almacenRepository.save(almacen);
    }

    /** Edita una bodega existente, incluyendo reasignar/quitar su Supervisor responsable. */
    @Override
    @Transactional
    public void actualizarAlmacen(Integer idAlmacen, AlmacenRequestDTO dto) {
        Almacen almacen = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado: " + idAlmacen));

        Ciudad ciudad = ciudadRepository.findById(dto.getIdCiudad())
                .orElseThrow(() -> new EntityNotFoundException("Ciudad no encontrada: " + dto.getIdCiudad()));

        Supervisor supervisor = null;
        if (dto.getIdSupervisor() != null) {
            supervisor = supervisorRepository.findById(dto.getIdSupervisor())
                    .orElseThrow(() -> new EntityNotFoundException("Supervisor no encontrado: " + dto.getIdSupervisor()));
        }

        almacen.setNombre(dto.getNombre());
        almacen.setDireccion(dto.getDireccion());
        almacen.setCapacidadTotal(dto.getCapacidadMaxima());
        if (dto.getIdEstado() != null) almacen.setIdEstado(dto.getIdEstado());
        almacen.setCiudad(ciudad);
        almacen.setSupervisor(supervisor);

        almacenRepository.save(almacen);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlmacenResponseDTO> listarTodos() {
        return almacenRepository.findAll().stream().map(AlmacenResponseDTO::from).toList();
    }

    @Override
    public void desactivarAlmacen(Integer idAlmacen, Integer idEstadoInactivo) {
        almacenRepository.desactivarAlmacen(idAlmacen);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ciudad> listarCiudades() {
        return ciudadRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupervisorOpcionDTO> listarSupervisoresDisponibles() {
        return supervisorRepository.findAll().stream().map(SupervisorOpcionDTO::from).toList();
    }

    // ── Cascada 3.1 ──────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ZonaAlmacenResponseDTO> listarZonasPorAlmacen(Integer idAlmacen) {
        return zonaRepository.findByAlmacen_IdAlmacen(idAlmacen)
                .stream()
                .map(ZonaAlmacenResponseDTO::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstanteriaResponseDTO> listarEstanteriasPorZona(Integer idZona) {
        return estanteriaRepository.findByZona_IdZona(idZona)
                .stream()
                .map(EstanteriaResponseDTO::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UbicacionInternaResponseDTO> listarUbicacionesPorEstanteria(Integer idEstanteria) {
        java.util.Map<Integer, Integer> ocupacionReal = obtenerOcupacionRealPorUbicacion();
        return ubicacionRepository.findByEstanteria_IdEstanteria(idEstanteria)
                .stream()
                .map(u -> UbicacionInternaResponseDTO.from(u, ocupacionReal.getOrDefault(u.getIdUbicacion(), 0)))
                .toList();
    }

    /** Unidades realmente ocupadas por ubicación, sumando cantidad_actual de los lotes reales — ver ILoteRepository.sumCantidadActualAgrupadoPorUbicacion */
    private java.util.Map<Integer, Integer> obtenerOcupacionRealPorUbicacion() {
        java.util.Map<Integer, Integer> mapa = new java.util.HashMap<>();
        for (Object[] fila : loteRepository.sumCantidadActualAgrupadoPorUbicacion()) {
            mapa.put((Integer) fila[0], ((Number) fila[1]).intValue());
        }
        return mapa;
    }

    // ── Módulo 2: Topología Jerárquica (Árbol) ───────────────

    @Override
    @Transactional(readOnly = true)
    public List<NodoTopologiaDTO> obtenerArbolTopologia() {
        List<Almacen> almacenes = almacenRepository.findAll();
        java.util.Map<Integer, Integer> ocupacionReal = obtenerOcupacionRealPorUbicacion();
        List<NodoTopologiaDTO> arbol = new ArrayList<>();

        for (Almacen alm : almacenes) {
            NodoTopologiaDTO nodoAlm = NodoTopologiaDTO.builder()
                    .id("almacen-" + alm.getIdAlmacen())
                    .tipo("ALMACEN")
                    .idReal(alm.getIdAlmacen())
                    .nombre(alm.getNombre())
                    .subtitulo("Capacidad Total: " + (alm.getCapacidadTotal() != null ? alm.getCapacidadTotal() : 0))
                    .hijos(new ArrayList<>())
                    .build();

            List<ZonaAlmacen> zonas = zonaRepository.findByAlmacen_IdAlmacen(alm.getIdAlmacen());
            for (ZonaAlmacen zona : zonas) {
                NodoTopologiaDTO nodoZona = NodoTopologiaDTO.builder()
                        .id("zona-" + zona.getIdZona())
                        .tipo("ZONA")
                        .idReal(zona.getIdZona())
                        .nombre(zona.getNombre())
                        .subtitulo(zona.getCondicionClimatica() != null ? zona.getCondicionClimatica() : "Estándar")
                        .hijos(new ArrayList<>())
                        .build();

                List<Estanteria> estanterias = estanteriaRepository.findByZona_IdZona(zona.getIdZona());
                for (Estanteria est : estanterias) {
                    NodoTopologiaDTO nodoEst = NodoTopologiaDTO.builder()
                            .id("estanteria-" + est.getIdEstanteria())
                            .tipo("ESTANTERIA")
                            .idReal(est.getIdEstanteria())
                            .nombre("Estantería " + est.getCodigo())
                            .subtitulo("Código: " + est.getCodigo())
                            .hijos(new ArrayList<>())
                            .build();

                    List<UbicacionInterna> ubicaciones = ubicacionRepository.findByEstanteria_IdEstanteria(est.getIdEstanteria());
                    for (UbicacionInterna u : ubicaciones) {
                        int capMax = u.getCapacidadMaxima() != null ? u.getCapacidadMaxima() : 100;
                        int capAct = ocupacionReal.getOrDefault(u.getIdUbicacion(), 0);
                        int pct = capMax > 0 ? (int) Math.round(((double) capAct / capMax) * 100.0) : 0;
                        String qr = u.getCodigoQr() != null ? u.getCodigoQr() : ("UBIC-EST" + est.getIdEstanteria() + "-N" + u.getNivel() + "-P" + u.getPosicion());

                        NodoTopologiaDTO nodoUbic = NodoTopologiaDTO.builder()
                                .id("ubicacion-" + u.getIdUbicacion())
                                .tipo("UBICACION")
                                .idReal(u.getIdUbicacion())
                                .nombre("Nivel " + u.getNivel() + " / Pos. " + u.getPosicion())
                                .subtitulo("Capacidad: " + capAct + " / " + capMax + " un. (" + pct + "%)")
                                .capacidadMaxima(capMax)
                                .capacidadActual(capAct)
                                .porcentajeOcupacion(pct)
                                .codigoQr(qr)
                                .hijos(new ArrayList<>())
                                .build();

                        nodoEst.getHijos().add(nodoUbic);
                    }
                    nodoZona.getHijos().add(nodoEst);
                }
                nodoAlm.getHijos().add(nodoZona);
            }
            arbol.add(nodoAlm);
        }
        return arbol;
    }

    @Override
    @Transactional
    public void crearZona(String nombre, String condicionClimatica, Integer idAlmacen) {
        Almacen alm = almacenRepository.findById(idAlmacen)
                .orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado: " + idAlmacen));

        ZonaAlmacen zona = ZonaAlmacen.builder()
                .nombre(nombre)
                .condicionClimatica(condicionClimatica)
                .almacen(alm)
                .build();
        zonaRepository.save(zona);
    }

    @Override
    @Transactional
    public void crearEstanteria(String codigo, Integer idZona) {
        ZonaAlmacen zona = zonaRepository.findById(idZona)
                .orElseThrow(() -> new EntityNotFoundException("Zona no encontrada: " + idZona));

        Estanteria est = Estanteria.builder()
                .codigo(codigo.toUpperCase().trim())
                .zona(zona)
                .build();
        estanteriaRepository.save(est);
    }

    @Override
    @Transactional
    public void crearUbicacion(String nivel, String posicion, Integer capacidadMaxima, Integer idEstanteria) {
        Estanteria est = estanteriaRepository.findById(idEstanteria)
                .orElseThrow(() -> new EntityNotFoundException("Estantería no encontrada: " + idEstanteria));

        int capMax = (capacidadMaxima != null && capacidadMaxima > 0) ? capacidadMaxima : 100;
        String qr = "UBIC-EST" + idEstanteria + "-N" + nivel.trim() + "-P" + posicion.trim().toUpperCase();

        UbicacionInterna ubic = UbicacionInterna.builder()
                .nivel(nivel.trim())
                .posicion(posicion.trim().toUpperCase())
                .capacidadMaxima(capMax)
                .capacidadActual(0)
                .codigoQr(qr)
                .idEstado(1)
                .estanteria(est)
                .build();

        ubicacionRepository.save(ubic);
    }

    // ── Módulo 2: Generación QR & Auditoría ──────────────────

    @Override
    @Transactional(readOnly = true)
    public String generarQrUbicacionBase64(Integer idUbicacion) {
        UbicacionInterna u = ubicacionRepository.findById(idUbicacion)
                .orElseThrow(() -> new EntityNotFoundException("Ubicación no encontrada: " + idUbicacion));

        String qrCode = u.getCodigoQr() != null ? u.getCodigoQr() : ("UBIC-EST" + (u.getEstanteria() != null ? u.getEstanteria().getIdEstanteria() : "0") + "-N" + u.getNivel() + "-P" + u.getPosicion());
        String payloadJson = "{\"id_ubicacion\":" + u.getIdUbicacion() + ",\"codigo_qr\":\"" + qrCode + "\"}";

        return qrService.generarQrBase64(payloadJson, 300, 300);
    }

    @Override
    @Transactional(readOnly = true)
    public UbicacionDetalleQrDTO obtenerDetalleUbicacionPorQr(String codigoQr) {
        UbicacionInterna u = ubicacionRepository.findByCodigoQr(codigoQr.trim())
                .orElseGet(() -> {
                    // Si el código viene como número ID
                    try {
                        int id = Integer.parseInt(codigoQr.trim());
                        return ubicacionRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Ubicación no encontrada para QR: " + codigoQr));
                    } catch (NumberFormatException e) {
                        throw new EntityNotFoundException("Ubicación no encontrada para QR: " + codigoQr);
                    }
                });

        String codigoEst = u.getEstanteria() != null ? u.getEstanteria().getCodigo() : "?";
        String zonaNom = (u.getEstanteria() != null && u.getEstanteria().getZona() != null) ? u.getEstanteria().getZona().getNombre() : "?";
        String almNom = (u.getEstanteria() != null && u.getEstanteria().getZona() != null && u.getEstanteria().getZona().getAlmacen() != null) ? u.getEstanteria().getZona().getAlmacen().getNombre() : "?";

        int capMax = u.getCapacidadMaxima() != null ? u.getCapacidadMaxima() : 100;
        int capAct = u.getCapacidadActual() != null ? u.getCapacidadActual() : 0;
        int capDisp = Math.max(0, capMax - capAct);
        int pctOcup = capMax > 0 ? (int) Math.round(((double) capAct / capMax) * 100.0) : 0;

        List<LoteResponseDTO> lotes = loteRepository.findByUbicacion_IdUbicacion(u.getIdUbicacion())
                .stream()
                .map(LoteResponseDTO::from)
                .toList();

        String nivelRaw = u.getNivel() != null ? u.getNivel().trim() : "1";
        String posRaw = u.getPosicion() != null ? u.getPosicion().trim() : "A";
        String nivelClean = nivelRaw.toLowerCase().startsWith("nivel") ? nivelRaw : "Nivel " + nivelRaw;
        String posClean = posRaw.toLowerCase().startsWith("pos") ? posRaw : "Pos. " + posRaw;
        String qrClean = u.getCodigoQr() != null ? u.getCodigoQr() : ("UBIC-EST" + (u.getEstanteria() != null ? u.getEstanteria().getIdEstanteria() : "0") + "-N" + nivelRaw + "-P" + posRaw);

        return UbicacionDetalleQrDTO.builder()
                .idUbicacion(u.getIdUbicacion())
                .codigoQr(qrClean)
                .descripcionCompleta(codigoEst + " / " + nivelClean + " / " + posClean)
                .nombreAlmacen(almNom)
                .nombreZona(zonaNom)
                .codigoEstanteria(codigoEst)
                .nivel(nivelRaw)
                .posicion(posRaw)
                .capacidadMaxima(capMax)
                .capacidadActual(capAct)
                .capacidadDisponible(capDisp)
                .porcentajeOcupacion(pctOcup)
                .lotesAlmacenados(lotes)
                .build();
    }

    @Override
    @Transactional
    public UbicacionDetalleQrDTO registrarConteoFisico(ConteoFisicoRequestDTO dto) {
        UbicacionInterna u = ubicacionRepository.findById(dto.getIdUbicacion())
                .orElseThrow(() -> new EntityNotFoundException("Ubicación no encontrada: " + dto.getIdUbicacion()));

        // Actualizar el conteo físico actual en la ubicación
        u.setCapacidadActual(dto.getConteoFisico());
        ubicacionRepository.save(u);

        return obtenerDetalleUbicacionPorQr(u.getCodigoQr() != null ? u.getCodigoQr() : String.valueOf(u.getIdUbicacion()));
    }
}
