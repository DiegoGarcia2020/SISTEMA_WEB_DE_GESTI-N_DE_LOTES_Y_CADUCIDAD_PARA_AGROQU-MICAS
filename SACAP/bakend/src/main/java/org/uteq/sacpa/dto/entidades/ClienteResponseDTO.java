package org.uteq.sacpa.dto.entidades;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.entidades.Cliente;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ClienteResponseDTO {
    private Integer idCliente;
    private String nombre;
    private String cedulaRuc;
    private String telefono;
    private String ubicacionFinca;
    private Integer idEstado;

    public static ClienteResponseDTO from(Cliente c) {
        return ClienteResponseDTO.builder()
                .idCliente(c.getIdCliente())
                .nombre(c.getNombre())
                .cedulaRuc(c.getCedulaRuc())
                .telefono(c.getTelefono())
                .ubicacionFinca(c.getUbicacionFinca())
                .idEstado(c.getIdEstado())
                .build();
    }
}
