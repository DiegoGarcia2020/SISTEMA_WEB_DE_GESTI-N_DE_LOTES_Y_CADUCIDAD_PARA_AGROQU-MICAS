package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos_lote", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentoLote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento") private Integer idDocumento;
    @Column(name = "nombre_archivo", length = 200) private String nombreArchivo;
    @Column(name = "ruta_archivo", length = 500) private String rutaArchivo;
    @Column(name = "tipo_documento", length = 100) private String tipoDocumento;
    @Column(name = "fecha_subida") private LocalDateTime fechaSubida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lote") private Lote lote;
}
