package org.uteq.sacpa.service.entidades.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.repository.entidades.IClienteRepository;
import org.uteq.sacpa.service.entidades.IClienteService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements IClienteService {

    private final IClienteRepository clienteRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public Cliente crearCliente(ClienteRequestDTO dto) {
        if (clienteRepository.findByCedula(dto.getCedula()).isPresent()) {
            throw new RuntimeException("Ya existe un cliente registrado con la cédula: " + dto.getCedula());
        }
        Integer idCliente = jdbcTemplate.queryForObject(
                "SELECT entidades.fn_crear_cliente(?, ?, ?, ?, ?)",
                Integer.class,
                dto.getNombreFinca(), dto.getCedula(), dto.getTelefono(), dto.getDireccion(), dto.getIdTecnico());
        return clienteRepository.findById(idCliente)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el cliente recién creado: " + idCliente));
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

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> buscar(String texto) {
        return clienteRepository.findByNombreFincaContainingIgnoreCaseOrCedulaContainingIgnoreCase(texto, texto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> buscarPorTecnico(String texto, Integer idTecnico) {
        return clienteRepository.buscarPorTecnico(idTecnico, texto);
    }
}
