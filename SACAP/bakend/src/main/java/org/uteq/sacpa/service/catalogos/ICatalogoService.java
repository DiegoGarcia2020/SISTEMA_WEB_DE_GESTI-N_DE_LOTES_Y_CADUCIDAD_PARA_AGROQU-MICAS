package org.uteq.sacpa.service.catalogos;

import org.uteq.sacpa.dto.catalogos.CatalogoRequestDTO;
import org.uteq.sacpa.entity.catalogos.*;

import java.util.List;

public interface ICatalogoService {

    // Estado General
    List<CatEstadoGeneral> listarEstadosGenerales();
    void crearEstadoGeneral(CatalogoRequestDTO dto);

    // Estado Lote
    List<CatEstadoLote> listarEstadosLote();
    void crearEstadoLote(CatalogoRequestDTO dto);

    // Estado Aprobacion
    List<CatEstadoAprobacion> listarEstadosAprobacion();
    void crearEstadoAprobacion(CatalogoRequestDTO dto);

    // Nivel Alerta
    List<CatNivelAlerta> listarNivelesAlerta();
    void crearNivelAlerta(CatalogoRequestDTO dto);

    // Tipo Movimiento
    List<CatTipoMovimiento> listarTiposMovimiento();
    void crearTipoMovimiento(CatalogoRequestDTO dto);
}
