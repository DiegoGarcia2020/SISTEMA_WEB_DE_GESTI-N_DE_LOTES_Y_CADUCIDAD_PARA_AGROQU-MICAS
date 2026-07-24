package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.PromocionRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.Promocion;

import java.util.List;

public interface IPromocionService {

    void crearPromocion(PromocionRequestDTO dto);

    List<Promocion> listarTodas();

    List<Promocion> listarPorEstado(Integer idEstado);

    void desactivarPromocion(Integer idPromocion, Integer idEstadoInactivo);

    void cambiarEstadoPromocion(Integer idPromocion, Integer idEstado);
}
