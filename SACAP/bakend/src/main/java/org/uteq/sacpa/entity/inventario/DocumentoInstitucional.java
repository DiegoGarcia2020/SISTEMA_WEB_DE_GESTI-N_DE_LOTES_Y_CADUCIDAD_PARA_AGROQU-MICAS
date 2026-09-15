package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Documento institucional del establecimiento (permiso de funcionamiento AGROCALIDAD, LUAE,
 * RUC, certificado ambiental, registro sanitario) -- disponible para inspección regulatoria.
 * Res. 0227, Anexo 1, puntos 1-2. id_almacen null = documento de la empresa en general.
 */
@Entity
@Table(name = "documento_institucional", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentoInstitucional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private Integer idDocumento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_almacen")
    private Almacen almacen;

    @Column(name = "tipo_documento", nullable = false, length = 100)
    private String tipoDocumento;

    @Column(name = "nombre_archivo", nullable = false, length = 200)
    private String nombreArchivo;

    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;

    @Column(name = "fecha_emision")
    private LocalDate fechaEmision;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_subida", nullable = false)
    private Usuario usuarioSubida;

    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida;
}
