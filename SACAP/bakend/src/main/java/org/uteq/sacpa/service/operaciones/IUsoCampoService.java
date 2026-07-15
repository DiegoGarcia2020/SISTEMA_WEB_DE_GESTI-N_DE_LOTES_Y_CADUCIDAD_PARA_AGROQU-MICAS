package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.operaciones.UsoCampoRequestDTO;
import org.uteq.sacpa.entity.operaciones.UsoCampo;

import java.time.LocalDate;
import java.util.List;

public interface IUsoCampoService {

    void crearUsoCampo(UsoCampoRequestDTO dto);

    List<UsoCampo> buscarPorLote(Integer idLote);

    void anularUsoCampo(Integer idUsoCampo, Integer idEstadoAnulado);
}
