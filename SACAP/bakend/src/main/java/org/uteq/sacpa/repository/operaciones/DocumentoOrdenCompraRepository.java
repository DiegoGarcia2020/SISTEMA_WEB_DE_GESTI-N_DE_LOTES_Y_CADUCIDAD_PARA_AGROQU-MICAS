package org.uteq.sacpa.repository.operaciones;

import org.springframework.data.jpa.repository.JpaRepository;
import org.uteq.sacpa.entity.operaciones.DocumentoOrdenCompra;

import java.util.List;

public interface DocumentoOrdenCompraRepository extends JpaRepository<DocumentoOrdenCompra, Integer> {
    List<DocumentoOrdenCompra> findByOrdenCompra_Id(Integer idOrdenCompra);
}
