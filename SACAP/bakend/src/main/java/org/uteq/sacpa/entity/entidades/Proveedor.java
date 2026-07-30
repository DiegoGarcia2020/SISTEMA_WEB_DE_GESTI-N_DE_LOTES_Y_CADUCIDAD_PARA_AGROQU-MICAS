package org.uteq.sacpa.entity.entidades;

import jakarta.persistence.*;
import lombok.*;
import org.uteq.sacpa.entity.geografia.Ciudad;

@Entity
@Table(name = "proveedor", schema = "entidades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Proveedor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor") private Integer idProveedor;
    
    @Column(name = "nombre_representante", nullable = false, length = 200) 
    private String nombreRepresentante;
    
    @Column(name = "ruc", nullable = false, unique = true, length = 13) 
    private String ruc;
    
    @Column(name = "telefono", length = 30) 
    private String telefono;
    
    @Column(name = "telefono_empresa", length = 30) 
    private String telefonoEmpresa;
    
    @Column(name = "direccion", length = 300) 
    private String direccion;
    
    @Column(name = "correo_contacto", length = 150) 
    private String correoContacto;
    
    @Column(name = "id_estado") 
    private Integer idEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empresa") 
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ciudad") 
    private Ciudad ciudad;
}
