package org.uteq.sacpa.service.geografia.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.geografia.PaisRequestDTO;
import org.uteq.sacpa.entity.geografia.Pais;
import org.uteq.sacpa.repository.geografia.IPaisRepository;
import org.uteq.sacpa.service.geografia.IPaisService;

import java.util.List;

@Service
public class PaisServiceImpl implements IPaisService {

    @Autowired
    private IPaisRepository paisRepository;

    @Override
    public void crearPais(PaisRequestDTO dto) {
        paisRepository.crearPais(dto.getNombre(), dto.getCodigoIso());
    }

    @Override
    public List<Pais> listarTodos() {
        return paisRepository.findAll();
    }

    @Override
    public void actualizarPais(Integer idPais, PaisRequestDTO dto) {
        paisRepository.actualizarPais(idPais, dto.getNombre(), dto.getCodigoIso());
    }

    @Override
    public void desactivarPais(Integer idPais) {
        paisRepository.desactivarPais(idPais);
    }
}
