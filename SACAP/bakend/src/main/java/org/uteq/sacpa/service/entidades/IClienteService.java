package org.uteq.sacpa.service.entidades;

import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.entity.entidades.Cliente;

import java.util.List;

public interface IClienteService {

    Cliente crearCliente(ClienteRequestDTO dto);

    List<Cliente> listarTodos();

    List<Cliente> listarPorTecnico(Integer idTecnico);

    List<Cliente> buscar(String texto);

    List<Cliente> buscarPorTecnico(String texto, Integer idTecnico);
}
