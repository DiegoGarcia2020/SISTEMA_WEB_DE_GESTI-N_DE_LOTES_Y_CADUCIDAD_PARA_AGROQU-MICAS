package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para que el Supervisor vea los usuarios con rol Bodeguero y a qué
 * bodega están asignados actualmente (si a ninguna, los campos de bodega
 * quedan null y el frontend pinta "Sin bodega asignada").
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BodegueroDisponibleDTO {
    private Integer idUsuario;
    private String correo;
    private String nombres;
    private String apellidos;
    private String telefono;
    private Integer idAlmacenAsignado;
    private String nombreAlmacenAsignado;
}
