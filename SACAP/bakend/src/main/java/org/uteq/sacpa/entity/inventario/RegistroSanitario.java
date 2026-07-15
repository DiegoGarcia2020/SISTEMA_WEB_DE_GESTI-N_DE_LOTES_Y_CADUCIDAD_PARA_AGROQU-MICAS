package org.uteq.sacpa.entity.inventario;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "registro_sanitario", schema = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroSanitario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro") private Integer idRegistro;
    @Column(name = "numero_registro", length = 100) private String numeroRegistro;
    @Column(name = "organismo_emisor", length = 200) private String organismoEmisor;
    @Column(name = "fecha_emision") private LocalDate fechaEmision;
    @Column(name = "fecha_vigencia") private LocalDate fechaVigencia;
    @Column(name = "id_estado") private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto") private Producto producto;
}
