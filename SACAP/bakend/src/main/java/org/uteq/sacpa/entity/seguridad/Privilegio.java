package org.uteq.sacpa.entity.seguridad;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "privilegio", schema = "seguridad")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Privilegio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_privilegio")
    private Integer idPrivilegio;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "accion", length = 100)
    private String accion;

    @Column(name = "activo")
    private Boolean activo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_tipo_objeto")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TipoObjetoSeguridad tipoObjeto;

    @Column(name = "esquema", length = 100)
    private String esquema;

    @Column(name = "nombre_tabla", length = 100)
    private String nombreTabla;
}
