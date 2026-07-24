package org.uteq.sacpa.service.entidades;

import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;

import java.util.List;

public interface IClienteService {

    void crearCliente(ClienteRequestDTO dto);

    List<Cliente> listarTodos();

    List<Cliente> listarPorTecnico(Integer idTecnico);
}
