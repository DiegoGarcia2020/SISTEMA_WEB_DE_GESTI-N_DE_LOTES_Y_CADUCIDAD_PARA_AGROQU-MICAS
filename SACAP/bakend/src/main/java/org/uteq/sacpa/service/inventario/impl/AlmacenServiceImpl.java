package org.uteq.sacpa.service.inventario.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.inventario.*;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.repository.inventario.IAlmacenRepository;
import org.uteq.sacpa.repository.inventario.IEstanteriaRepository;
import org.uteq.sacpa.repository.inventario.IUbicacionInternaRepository;
import org.uteq.sacpa.repository.inventario.IZonaAlmacenRepository;
import org.uteq.sacpa.service.inventario.IAlmacenService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlmacenServiceImpl implements IAlmacenService {

    private final IAlmacenRepository         almacenRepository;
    private final IZonaAlmacenRepository     zonaRepository;
    private final IEstanteriaRepository      estanteriaRepository;
    private final IUbicacionInternaRepository ubicacionRepository;

    @Override
    public void crearAlmacen(AlmacenRequestDTO dto) {
        almacenRepository.crearAlmacen(dto.getNombre(), dto.getCapacidadMaxima(), dto.getIdCiudad());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Almacen> listarTodos() {
        return almacenRepository.findAll();
    }

    @Override
    public void desactivarAlmacen(Integer idAlmacen, Integer idEstadoInactivo) {
        almacenRepository.desactivarAlmacen(idAlmacen);
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
        return ubicacionRepository.findByEstanteria_IdEstanteria(idEstanteria)
                .stream()
                .map(UbicacionInternaResponseDTO::from)
                .toList();
    }
}
