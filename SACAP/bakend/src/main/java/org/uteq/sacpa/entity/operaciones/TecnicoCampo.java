package org.uteq.sacpa.entity.operaciones;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.seguridad.Usuario;

@Entity
@Table(name = "tecnico_campo", schema = "operaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TecnicoCampo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tecnico") private Integer idTecnico;
    @Column(name = "cedula", unique = true, length = 20) private String cedula;
    @Column(name = "nombres", length = 150) private String nombres;
    @Column(name = "apellidos", length = 150) private String apellidos;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "licencia_agricola", length = 100) private String licenciaAgricola;
    @Column(name = "id_estado") private Integer idEstado;

    @Transient
    private byte[] documentoPdf;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", unique = true) private Usuario usuario;
}
