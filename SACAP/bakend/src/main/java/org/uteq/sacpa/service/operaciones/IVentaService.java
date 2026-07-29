package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.dto.operaciones.VentaCreateRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaDashboardResponseDTO;
import org.uteq.sacpa.dto.operaciones.VentaResponseDTO;
import org.uteq.sacpa.entity.catalogos.CatCultivo;
import org.uteq.sacpa.entity.catalogos.CatPlaga;
import org.uteq.sacpa.entity.inventario.Categoria;

import java.util.List;

public interface IVentaService {

    VentaDashboardResponseDTO obtenerDashboard(Integer idUsuarioAutenticado);

    /** Categorías de producto — el "problema a tratar" que elige el Técnico */
    List<Categoria> obtenerCategorias();

    List<SugerenciaComboDTO> obtenerSugerencias(Integer idCategoria);

    /** Cultivos activos, para el selector del diagnóstico (cultivo + plaga) */
    List<CatCultivo> obtenerCultivos();

    /** Plagas/enfermedades activas, para el selector del diagnóstico */
    List<CatPlaga> obtenerPlagas();

    /** Sugerencias por diagnóstico: filtra productos etiquetados con esa plaga (idCultivo opcional) */
    List<SugerenciaComboDTO> obtenerSugerenciasPorPlaga(Integer idPlaga, Integer idCultivo);

    /** Checkout atómico: crea la Venta + DetalleVenta y reserva stock. Lanza excepción si no hay stock. */
    VentaResponseDTO crearVenta(Integer idUsuarioAutenticado, VentaCreateRequestDTO dto);

    List<VentaResponseDTO> misVentas(Integer idUsuarioAutenticado);

    VentaResponseDTO obtenerVenta(Integer idVenta);
}
