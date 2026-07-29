package org.uteq.sacpa.service.entidades;

import org.uteq.sacpa.dto.entidades.ClienteRequestDTO;
import org.uteq.sacpa.dto.entidades.ClienteResponseDTO;

import java.util.List;

public interface IClienteService {
    ClienteResponseDTO crearCliente(ClienteRequestDTO dto);
    ClienteResponseDTO actualizarCliente(Integer idCliente, ClienteRequestDTO dto);
    List<ClienteResponseDTO> listarTodos();
    List<ClienteResponseDTO> buscar(String nombre);
    void desactivarCliente(Integer idCliente, Integer idEstadoInactivo);
}
