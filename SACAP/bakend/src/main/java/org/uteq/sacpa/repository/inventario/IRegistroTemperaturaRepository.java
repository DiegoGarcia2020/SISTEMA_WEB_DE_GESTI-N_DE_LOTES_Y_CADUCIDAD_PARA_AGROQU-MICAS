package org.uteq.sacpa.repository.inventario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.inventario.RegistroTemperatura;

public interface IRegistroTemperaturaRepository extends JpaRepository<RegistroTemperatura, Integer> {

    /** JOIN FETCH obligatorio: RegistroTemperaturaResponseDTO.from() lee zona.nombre y
     *  usuarioRegistro.correo (LAZY) fuera de la sesión de Hibernate si no se traen aquí. */
    @Query(value = "SELECT r FROM RegistroTemperatura r JOIN FETCH r.zona JOIN FETCH r.usuarioRegistro " +
                   "WHERE r.zona.idZona = :idZona ORDER BY r.fechaHora DESC",
           countQuery = "SELECT COUNT(r) FROM RegistroTemperatura r WHERE r.zona.idZona = :idZona")
    Page<RegistroTemperatura> findByZona_IdZonaOrderByFechaHoraDesc(@Param("idZona") Integer idZona, Pageable pageable);

    @Query(value = "SELECT r FROM RegistroTemperatura r JOIN FETCH r.zona z JOIN FETCH r.usuarioRegistro " +
                   "WHERE z.almacen.idAlmacen = :idAlmacen ORDER BY r.fechaHora DESC",
           countQuery = "SELECT COUNT(r) FROM RegistroTemperatura r WHERE r.zona.almacen.idAlmacen = :idAlmacen")
    Page<RegistroTemperatura> findByZona_Almacen_IdAlmacenOrderByFechaHoraDesc(@Param("idAlmacen") Integer idAlmacen, Pageable pageable);
}
