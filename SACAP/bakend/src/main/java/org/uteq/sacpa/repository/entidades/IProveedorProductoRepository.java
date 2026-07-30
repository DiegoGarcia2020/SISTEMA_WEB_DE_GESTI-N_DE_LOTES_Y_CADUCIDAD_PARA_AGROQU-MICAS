package org.uteq.sacpa.repository.entidades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uteq.sacpa.entity.entidades.ProveedorProducto;

import java.util.List;
import java.util.Optional;

public interface IProveedorProductoRepository extends JpaRepository<ProveedorProducto, Integer> {

    @Query("SELECT pp FROM ProveedorProducto pp JOIN FETCH pp.producto WHERE pp.proveedor.idProveedor = :idProveedor AND pp.idEstado = 1")
    List<ProveedorProducto> findByProveedor_IdProveedor(@Param("idProveedor") Integer idProveedor);

    @Query("SELECT pp FROM ProveedorProducto pp JOIN FETCH pp.proveedor WHERE pp.producto.idProducto = :idProducto AND pp.idEstado = 1")
    List<ProveedorProducto> findByProducto_IdProducto(@Param("idProducto") Integer idProducto);

    boolean existsByProveedor_IdProveedorAndProducto_IdProducto(Integer idProveedor, Integer idProducto);
    
    Optional<ProveedorProducto> findByProveedor_IdProveedorAndProducto_IdProducto(Integer idProveedor, Integer idProducto);
}
