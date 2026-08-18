package org.uteq.sacpa.dto.entidades;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.entidades.Proveedor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProveedorResponseDTO {
    private Integer idProveedor;
    private String ruc;
    private String nombreRepresentante;
    private String telefonoEmpresa;
    private String telefono;
    private String nombreEmpresa;
    private String nombreCiudad;
    private String correoContacto;
    private Integer idEstado;

    public static ProveedorResponseDTO fromEntity(Proveedor p) {
        return ProveedorResponseDTO.builder()
                .idProveedor(p.getIdProveedor())
                .ruc(p.getRuc())
                .nombreRepresentante(p.getNombreRepresentante())
                .telefonoEmpresa(p.getTelefonoEmpresa())
                .telefono(p.getTelefono())
                .nombreEmpresa(p.getEmpresa() != null ? p.getEmpresa().getNombre() : null)
                .nombreCiudad(p.getCiudad() != null ? p.getCiudad().getNombre() : null)
                .correoContacto(p.getCorreoContacto())
                .idEstado(p.getIdEstado())
                .build();
    }
}
