package org.uteq.sacpa.service.ia_alertas;

import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.entity.inventario.Lote;

import java.util.List;

/**
 * Motor de sugerencias del Módulo 3 (reglas ponderadas, sin IA externa).
 * Cruza urgencia FEFO + temporada agrícola activa + categoría del producto
 * (proxy del "problema a tratar") para sugerir productos/combos con descuento.
 */
public interface IMotorSugerenciaIAService {

    /** Sugerencias para el Técnico, filtradas por categoría de producto (el "problema" elegido) */
    List<SugerenciaComboDTO> generarSugerencias(Integer idCategoria);

    /**
     * Sugerencias para el Técnico por diagnóstico: filtradas por la plaga que el producto trata,
     * acotado opcionalmente al cultivo del cliente (idCultivo puede ser null).
     */
    List<SugerenciaComboDTO> generarSugerenciasPorPlaga(Integer idPlaga, Integer idCultivo);

    /** Sugerencia puntual para un lote específico (usada al "promover" una alerta de caducidad) */
    SugerenciaComboDTO generarSugerenciaParaLote(Lote lote);
}
