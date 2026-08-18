package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documento_orden_compra", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentoOrdenCompra {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento") 
    private Integer idDocumento;
    
    @Column(name = "nombre_archivo", length = 200) 
    private String nombreArchivo;
    
    @Column(name = "url_archivo", length = 500) 
    private String urlArchivo;
    
    @Column(name = "tipo_documento", length = 100) 
    private String tipoDocumento;
    
    @Column(name = "fecha_subida") 
    private LocalDateTime fechaSubida;
    
    @Column(name = "id_usuario_subida")
    private Integer idUsuarioSubida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_orden_compra") 
    private OrdenCompra ordenCompra;
}
