package org.uteq.sacpa.dto.seguridad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EsquemaPrivilegiosDTO {
    private String esquema;
    private List<TablaPrivilegiosDTO> tablas;
}
