package org.uteq.sacpa.service.inventario;

import org.uteq.sacpa.dto.inventario.*;

import java.util.List;

public interface IAlmacenService {

    void crearAlmacen(AlmacenRequestDTO dto);

    void actualizarAlmacen(Integer idAlmacen, AlmacenRequestDTO dto);

    List<AlmacenResponseDTO> listarTodos();

    void desactivarAlmacen(Integer idAlmacen, Integer idEstadoInactivo);

    /** Ciudades disponibles para el selector del formulario "Nueva Bodega" */
    List<org.uteq.sacpa.entity.geografia.Ciudad> listarCiudades();

    /** Supervisores existentes para el selector "Asignar Supervisor" */
    List<SupervisorOpcionDTO> listarSupervisoresDisponibles();

    // ── Cascada 3.1 ──────────────────────────────────────────
    List<ZonaAlmacenResponseDTO>   listarZonasPorAlmacen(Integer idAlmacen);
    List<EstanteriaResponseDTO>    listarEstanteriasPorZona(Integer idZona);
    List<UbicacionInternaResponseDTO> listarUbicacionesPorEstanteria(Integer idEstanteria);

    // ── Módulo 2: Topología & QR & Auditoría ────────────────
    List<NodoTopologiaDTO> obtenerArbolTopologia();

    void crearZona(String nombre, String condicionClimatica, Integer idAlmacen);
    void crearEstanteria(String codigo, Integer idZona);
    void crearUbicacion(String nivel, String posicion, Integer capacidadMaxima, Integer idEstanteria);

    String generarQrUbicacionBase64(Integer idUbicacion);
    UbicacionDetalleQrDTO obtenerDetalleUbicacionPorQr(String codigoQr);
    UbicacionDetalleQrDTO registrarConteoFisico(ConteoFisicoRequestDTO dto);
}
