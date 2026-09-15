package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;

import org.uteq.sacpa.entity.entidades.Cliente;
import org.uteq.sacpa.entity.inventario.Producto;
import org.uteq.sacpa.entity.seguridad.Usuario;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Receta agrícola firmada por un Ing. Agrónomo/Agropecuario, requerida para
 * vender plaguicidas de categoría toxicológica Ia/Ib o marcados como de venta
 * restringida (AGROCALIDAD Resolución 0227, Anexo 1 punto 25 y Anexo 6).
 * Debe conservarse 2 años en el almacén de expendio: no purgar.
 */
@Entity
@Table(name = "receta_agricola", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecetaAgricola {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receta")
    private Integer idReceta;

    @Column(name = "numero_autorizacion", nullable = false, length = 100)
    private String numeroAutorizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "nombre_profesional", nullable = false, length = 200)
    private String nombreProfesional;

    @Column(name = "registro_profesional", length = 100)
    private String registroProfesional;

    @Column(name = "documento_url", columnDefinition = "text")
    private String documentoUrl;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_registro", nullable = false)
    private Usuario usuarioRegistro;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "usada", nullable = false)
    private Boolean usada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta_uso")
    private Venta ventaUso;

    @Column(name = "fecha_uso")
    private LocalDateTime fechaUso;
}
