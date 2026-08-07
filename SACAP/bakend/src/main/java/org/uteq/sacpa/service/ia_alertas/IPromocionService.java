package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.PromocionRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IPromocionService {

    PromocionResponseDTO crearPromocion(PromocionRequestDTO dto, Integer idUsuarioAprueba);

    /** Crea una promoción SUGERIDA ligada a una SugerenciaIA (usado por el flujo "promover alerta") */
    PromocionResponseDTO crearDesdeSugerencia(Integer idSugerencia, String nombre, String descripcion,
                                               BigDecimal descuentoGlobal, LocalDate fechaInicio, LocalDate fechaFin,
                                               Integer idUsuarioAprueba);

    List<PromocionResponseDTO> listarTodas();

    /** Transición SUGERIDA→APROBADA→ACTIVA o →RECHAZADA */
    void cambiarEstado(Integer idPromocion, String estado);

    List<Promocion> listarPorEstado(Integer idEstado);

    void desactivarPromocion(Integer idPromocion, Integer idEstadoInactivo);

    void cambiarEstadoPromocion(Integer idPromocion, Integer idEstado);
}
