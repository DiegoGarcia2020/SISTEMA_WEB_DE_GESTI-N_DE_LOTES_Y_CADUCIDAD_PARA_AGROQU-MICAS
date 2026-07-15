package org.uteq.sacpa.service.ia_alertas.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ia_modelos.PromocionRequestDTO;
import org.uteq.sacpa.entity.ia_alertas.Promocion;
import org.uteq.sacpa.repository.ia_alertas.IPromocionRepository;
import org.uteq.sacpa.service.ia_alertas.IPromocionService;

import java.util.List;

@Service
public class PromocionServiceImpl implements IPromocionService {

    @Autowired
    private IPromocionRepository promocionRepository;

    @Override
    public void crearPromocion(PromocionRequestDTO dto) {
        promocionRepository.crearPromocion(
                dto.getNombre(),
                dto.getDescripcion(),
                dto.getPorcentajeDescuento(),
                dto.getFechaInicio(),
                dto.getFechaFin(),
                null,
                null,
                dto.getIdEstado()
        );
    }

    @Override
    public List<Promocion> listarTodas() {
        return promocionRepository.findAll();
    }

    @Override
    public void desactivarPromocion(Integer idPromocion, Integer idEstadoInactivo) {
        promocionRepository.desactivarPromocion(idPromocion, idEstadoInactivo);
    }
}
