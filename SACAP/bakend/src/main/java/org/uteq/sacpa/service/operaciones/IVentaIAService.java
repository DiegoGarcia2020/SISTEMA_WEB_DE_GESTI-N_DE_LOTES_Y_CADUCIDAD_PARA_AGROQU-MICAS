package org.uteq.sacpa.service.operaciones;

import org.uteq.sacpa.dto.ia_alertas.SugerenciaComboDTO;
import org.uteq.sacpa.dto.operaciones.ProductoCatalogoDTO;
import org.uteq.sacpa.dto.operaciones.VentaCreateRequestDTO;
import org.uteq.sacpa.dto.operaciones.VentaDashboardResponseDTO;
import org.uteq.sacpa.dto.operaciones.VentaIAResponseDTO;
import org.uteq.sacpa.entity.catalogos.CatCultivo;
import org.uteq.sacpa.entity.catalogos.CatPlaga;
import org.uteq.sacpa.entity.inventario.Categoria;

import java.util.List;

public interface IVentaIAService {

    VentaDashboardResponseDTO obtenerDashboard(Integer idUsuarioAutenticado);

    /** Categorías de producto — el "problema a tratar" que elige el Técnico */
    List<Categoria> obtenerCategorias();

    List<SugerenciaComboDTO> obtenerSugerencias(Integer idCategoria);

    /** Cultivos activos, para el selector del diagnóstico (cultivo + plaga) */
    List<CatCultivo> obtenerCultivos();

    /** Plagas/enfermedades activas, para el selector del diagnóstico */
    List<CatPlaga> obtenerPlagas();

    List<ProductoCatalogoDTO> obtenerCatalogo(String q, Integer limit);

    /** Sugerencias por diagnóstico: filtra productos etiquetados con esa plaga (idCultivo opcional) */
    List<SugerenciaComboDTO> obtenerSugerenciasPorPlaga(Integer idPlaga, Integer idCultivo);

    /** Checkout atómico: crea la Venta + DetalleVenta (tabla unificada, trazada por lote) y reserva stock. */
    VentaIAResponseDTO crearVenta(Integer idUsuarioAutenticado, VentaCreateRequestDTO dto);

    List<VentaIAResponseDTO> misVentas(Integer idUsuarioAutenticado);

    VentaIAResponseDTO obtenerVenta(Integer idVenta);
}
