package org.uteq.sacpa.entity.ia_alertas;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.catalogos.CatNivelAlerta;
import org.uteq.sacpa.entity.seguridad.Usuario;

@Entity
@Table(name = "configuracion_alertas", schema = "ia_alertas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfiguracionAlerta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion") private Integer idConfiguracion;
    @Column(name = "dias_anticipacion") private Integer diasAnticipacion;
    @Column(name = "activo") private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nivel_alerta") private CatNivelAlerta nivelAlerta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_modificador") private Usuario usuarioModificador;
}
