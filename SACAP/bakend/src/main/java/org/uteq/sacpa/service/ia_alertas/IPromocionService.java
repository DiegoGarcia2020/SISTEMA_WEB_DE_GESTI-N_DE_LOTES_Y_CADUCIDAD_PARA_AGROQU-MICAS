package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_modelos.PromocionRequestDTO;
import org.uteq.sacpa.dto.ia_modelos.PromocionResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface IPromocionService {

    PromocionResponseDTO crearPromocion(PromocionRequestDTO dto, Integer idUsuarioAprueba);

    /** Crea una promoción SUGERIDA ligada a una SugerenciaIA (usado por el flujo "promover alerta") */
    PromocionResponseDTO crearDesdeSugerencia(Integer idSugerencia, String nombre, String descripcion,
                                               BigDecimal descuentoGlobal, LocalDate fechaInicio, LocalDate fechaFin,
                                               Integer idUsuarioAprueba);

    Page<PromocionResponseDTO> listarTodas(Pageable pageable);

    /** Transición SUGERIDA→APROBADA→ACTIVA o →RECHAZADA */
    void cambiarEstado(Integer idPromocion, String estado);

    Page<PromocionResponseDTO> listarPorEstado(Integer idEstado, Pageable pageable);

    Page<PromocionResponseDTO> listarPorEstadoNombre(String nombreEstado, Pageable pageable);

    void desactivarPromocion(Integer idPromocion, Integer idEstadoInactivo);

    void cambiarEstadoPromocion(Integer idPromocion, Integer idEstado);
}
