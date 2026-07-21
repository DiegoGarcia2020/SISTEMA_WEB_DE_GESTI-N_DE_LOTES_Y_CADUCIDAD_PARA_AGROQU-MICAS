package org.uteq.sacpa.service.geografia.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.geografia.CiudadRequestDTO;
import org.uteq.sacpa.entity.geografia.Ciudad;
import org.uteq.sacpa.repository.geografia.ICiudadRepository;
import org.uteq.sacpa.service.geografia.ICiudadService;

import java.util.List;

@Service
public class CiudadServiceImpl implements ICiudadService {

    @Autowired
    private ICiudadRepository ciudadRepository;

    @Override
    public void crearCiudad(CiudadRequestDTO dto) {
        ciudadRepository.crearCiudad(dto.getNombre(), dto.getIdProvincia());
    }

    @Override
    public List<Ciudad> listarTodos() {
        return ciudadRepository.findAll();
    }

    @Override
    public List<Ciudad> listarPorProvincia(Integer idProvincia) {
        return ciudadRepository.findByProvincia_IdProvincia(idProvincia);
    }

    @Override
    public void actualizarCiudad(Integer idCiudad, CiudadRequestDTO dto) {
        ciudadRepository.actualizarCiudad(idCiudad, dto.getNombre(), dto.getIdProvincia());
    }

    @Override
    public void desactivarCiudad(Integer idCiudad) {
        ciudadRepository.desactivarCiudad(idCiudad);
    }
}
