package org.uteq.sacpa.service.catalogos.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.catalogos.CatalogoRequestDTO;
import org.uteq.sacpa.entity.catalogos.*;
import org.uteq.sacpa.entity.entidades.Empresa;
import org.uteq.sacpa.entity.geografia.Ciudad;
import org.uteq.sacpa.repository.catalogos.*;
import org.uteq.sacpa.repository.entidades.IEmpresaRepository;
import org.uteq.sacpa.repository.geografia.ICiudadRepository;
import org.uteq.sacpa.service.catalogos.ICatalogoService;

import java.util.List;

@Service
public class CatalogoServiceImpl implements ICatalogoService {

    @Autowired
    private ICatEstadoGeneralRepository estadoGeneralRepo;
    @Autowired
    private ICatEstadoLoteRepository estadoLoteRepo;
    @Autowired
    private ICatEstadoAprobacionRepository estadoAprobacionRepo;
    @Autowired
    private ICatNivelAlertaRepository nivelAlertaRepo;
    @Autowired
    private ICatTipoMovimientoRepository tipoMovimientoRepo;
    @Autowired
    private IEmpresaRepository empresaRepo;
    @Autowired
    private ICiudadRepository ciudadRepo;

    @Override
    public List<Empresa> listarEmpresas() {
        return empresaRepo.findAll();
    }

    @Override
    public List<Ciudad> listarCiudades() {
        return ciudadRepo.findAll();
    }

    @Override
    public List<CatEstadoGeneral> listarEstadosGenerales() {
        return estadoGeneralRepo.findAll();
    }

    @Override
    public void crearEstadoGeneral(CatalogoRequestDTO dto) {
        estadoGeneralRepo.crearEstado(dto.getNombre());
    }

    @Override
    public List<CatEstadoLote> listarEstadosLote() {
        return estadoLoteRepo.findAll();
    }

    @Override
    public void crearEstadoLote(CatalogoRequestDTO dto) {
        estadoLoteRepo.crearEstado(dto.getNombre());
    }

    @Override
    public List<CatEstadoAprobacion> listarEstadosAprobacion() {
        return estadoAprobacionRepo.findAll();
    }

    @Override
    public void crearEstadoAprobacion(CatalogoRequestDTO dto) {
        estadoAprobacionRepo.crearEstado(dto.getNombre());
    }

    @Override
    public List<CatNivelAlerta> listarNivelesAlerta() {
        return nivelAlertaRepo.findAll();
    }

    @Override
    public void crearNivelAlerta(CatalogoRequestDTO dto) {
        nivelAlertaRepo.crearNivelAlerta(dto.getNombre());
    }

    @Override
    public List<CatTipoMovimiento> listarTiposMovimiento() {
        return tipoMovimientoRepo.findAll();
    }

    @Override
    public void crearTipoMovimiento(CatalogoRequestDTO dto) {
        tipoMovimientoRepo.crearTipoMovimiento(dto.getNombre(), dto.getNaturaleza());
    }
}
