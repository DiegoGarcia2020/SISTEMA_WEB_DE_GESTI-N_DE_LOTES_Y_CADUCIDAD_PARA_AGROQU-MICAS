package org.uteq.sacpa.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NodoTopologiaDTO {
    private String id;              // Ej: "almacen-1", "zona-3", "estanteria-5", "ubicacion-12"
    private String tipo;            // "ALMACEN", "ZONA", "ESTANTERIA", "UBICACION"
    private Integer idReal;         // ID numérico en la BD
    private String nombre;          // Nombre o código
    private String subtitulo;       // Info adicional (ej: "Capacidad: 5000" o "Nivel 1 / Pos. A")
    private Integer capacidadMaxima;
    private Integer capacidadActual;
    private Integer porcentajeOcupacion;
    private String codigoQr;
    
    @Builder.Default
    private List<NodoTopologiaDTO> hijos = new ArrayList<>();
}
