package org.uteq.sacpa.service.inventario.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.inventario.AlmacenRequestDTO;
import org.uteq.sacpa.entity.inventario.Almacen;
import org.uteq.sacpa.repository.inventario.IAlmacenRepository;
import org.uteq.sacpa.service.inventario.IAlmacenService;

import java.util.List;

@Service
public class AlmacenServiceImpl implements IAlmacenService {

    @Autowired
    private IAlmacenRepository almacenRepository;

    @Override
    public void crearAlmacen(AlmacenRequestDTO dto) {
        almacenRepository.crearAlmacen(
                dto.getNombre(),
                dto.getCapacidadMaxima(),
                dto.getIdCiudad()
        );
    }

    @Override
    public List<Almacen> listarTodos() {
        return almacenRepository.findAll();
    }

    @Override
    public void desactivarAlmacen(Integer idAlmacen, Integer idEstadoInactivo) {
        almacenRepository.desactivarAlmacen(idAlmacen);
    }
}
