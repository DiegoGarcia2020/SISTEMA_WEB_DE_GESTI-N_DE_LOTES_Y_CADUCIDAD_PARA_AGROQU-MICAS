package org.uteq.sacpa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaOperacionDTO<T> {
    private boolean valido;
    private String mensaje;
    private T datos;
}
