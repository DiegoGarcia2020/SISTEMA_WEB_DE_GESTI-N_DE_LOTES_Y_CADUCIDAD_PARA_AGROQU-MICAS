package org.uteq.sacpa.service.inventario.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.inventario.LoteRequestDTO;
import org.uteq.sacpa.entity.inventario.Lote;
import org.uteq.sacpa.repository.inventario.ILoteRepository;
import org.uteq.sacpa.service.inventario.ILoteService;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoteServiceImpl implements ILoteService {

    @Autowired
    private ILoteRepository loteRepository;

    @Override
    public void crearLote(LoteRequestDTO dto) {
        loteRepository.crearLote(
                dto.getNumeroLote(),
                dto.getFechaFabricacion(),
                dto.getFechaVencimiento(),
                dto.getCantidadInicial(),
                dto.getIdProducto(),
                dto.getIdProveedor(),
                dto.getIdUbicacion(),
                dto.getIdEstadoLote()
        );
    }

    @Override
    public List<Lote> listarTodos() {
        return loteRepository.findAll();
    }

    @Override
    public Lote buscarPorNumeroLote(String numeroLote) {
        return loteRepository.findByNumeroLote(numeroLote)
                .orElseThrow(() -> new RuntimeException("Lote no encontrado: " + numeroLote));
    }

    @Override
    public List<Lote> listarLotesProximosAVencer(LocalDate fechaLimite, Integer idEstadoActivo) {
        return loteRepository.findLotesProximosAVencer(fechaLimite, idEstadoActivo);
    }

    @Override
    public void anularLote(Integer idLote) {
        loteRepository.anularLote(idLote);
    }
}
