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

    @Override
    public void crearUsoCampo(UsoCampoRequestDTO dto) {
        usoCampoRepository.crearUsoCampo(
                "",
                dto.getCultivoParcela(),
                dto.getFechaUso(),
                dto.getCantidadUsada(),
                dto.getObservaciones(),
                dto.getIdLote(),
                dto.getIdTecnicoCampo()
        );
    }

    @Override
    public List<UsoCampo> buscarPorLote(Integer idLote) {
        return usoCampoRepository.findByLote_IdLote(idLote);
    }

    @Override
    public void anularUsoCampo(Integer idUsoCampo, Integer idEstadoAnulado) {
        usoCampoRepository.anularUsoCampo(idUsoCampo);
    }
}
