package org.uteq.sacpa.service.geografia.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.geografia.ProvinciaRequestDTO;
import org.uteq.sacpa.entity.geografia.Provincia;
import org.uteq.sacpa.repository.geografia.IProvinciaRepository;
import org.uteq.sacpa.service.geografia.IProvinciaService;

import java.util.List;

@Service
public class ProvinciaServiceImpl implements IProvinciaService {

    @Autowired
    private IProvinciaRepository provinciaRepository;

    @Override
    public void crearProvincia(ProvinciaRequestDTO dto) {
        provinciaRepository.crearProvincia(dto.getNombre(), dto.getIdPais());
    }

    @Override
    public List<Provincia> listarTodos() {
        return provinciaRepository.findAll();
    }

    @Override
    public List<Provincia> listarPorPais(Integer idPais) {
        return provinciaRepository.findByPais_IdPais(idPais);
    }

    @Override
    public void actualizarProvincia(Integer idProvincia, ProvinciaRequestDTO dto) {
        provinciaRepository.actualizarProvincia(idProvincia, dto.getNombre(), dto.getIdPais());
    }

    @Override
    public void desactivarProvincia(Integer idProvincia) {
        provinciaRepository.desactivarProvincia(idProvincia);
    }
}
