package org.uteq.sacpa.service.entidades.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.repository.entidades.IClienteRepository;
import org.uteq.sacpa.service.entidades.IClienteService;

import java.util.List;

@Service
public class ClienteServiceImpl implements IClienteService {

    @Autowired
    private IClienteRepository clienteRepository;

    @Override
    @Transactional
    public void crearCliente(ClienteRequestDTO dto) {
        if (clienteRepository.findByCedula(dto.getCedula()).isPresent()) {
            throw new RuntimeException("Ya existe un cliente registrado con la cédula: " + dto.getCedula());
        }
        clienteRepository.crearCliente(
                dto.getNombreFinca(),
                dto.getCedula(),
                dto.getTelefono(),
                dto.getDireccion(),
                dto.getIdTecnico()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> listarPorTecnico(Integer idTecnico) {
        return clienteRepository.findByTecnicoAsignado_IdUsuario(idTecnico);
    }
}
