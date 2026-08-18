import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ─── Tipos ────────────────────────────────────────────────
export interface AlmacenDTO {
  idAlmacen:      number;
  nombre:         string;
  capacidadTotal: number;
  ciudad:         string;
  idEstado:       number;
}

export interface ZonaDTO {
  idZona:            number;
  nombre:            string;
  condicionClimatica: string;
  idAlmacen:         number;
}

export interface EstanteriaDTO {
  idEstanteria: number;
  codigo:       string;
  idZona:       number;
  codigoAlfa?:  string;
  tipoMaterial?: string;
}

export interface UbicacionDTO {
  idUbicacion:         number;
  nivel:               string;
  posicion:            string;
  descripcionCompleta: string;
  codigoEstanteria:    string;
  capacidadMaxima?:    number;
  capacidadActual?:    number;
  capacidadDisponible?: number;
  porcentajeOcupacion?: number;
  codigoQr?:           string;
  codigoNivel?:        string;
}

export interface NodoTopologiaDTO {
  id:                  string;
  tipo:                'ALMACEN' | 'ZONA' | 'ESTANTERIA' | 'UBICACION';
  idReal:              number;
  nombre:              string;
  subtitulo?:          string;
  capacidadMaxima?:    number;
  capacidadActual?:    number;
  porcentajeOcupacion?: number;
  codigoQr?:           string;
  hijos:               NodoTopologiaDTO[];
}

export interface UbicacionDetalleQrDTO {
  idUbicacion:         number;
  codigoQr:            string;
  descripcionCompleta: string;
  nombreAlmacen:       string;
  nombreZona:          string;
  codigoEstanteria:    string;
  nivel:               string;
  posicion:            string;
  capacidadMaxima:     number;
  capacidadActual:     number;
  capacidadDisponible: number;
  porcentajeOcupacion: number;
  lotesAlmacenados:    LoteDTO[];
}

export interface LoteDTO {
  idLote:               number;
  numeroLote:           string;
  fechaFabricacion:     string;
  fechaVencimiento:     string;
  cantidadInicial:      number;
  cantidadActual:       number;
  fechaIngreso:         string;
  idEstadoLote:         number;
  idProducto:           number;
  nombreProducto:       string;
  idProveedor:          number;
  nombreProveedor:      string;
  idUbicacion:          number;
  descripcionUbicacion: string;
  diasHastaVencimiento: number;
}

export interface LotePreRegistroRequest {
  numeroLote:        string;
  fechaFabricacion:  string;
  fechaVencimiento:  string;
  cantidadDeclarada: number;
  idProducto:        number;
  idProveedor:       number;
}

export interface LoteValidacionRequest {
  cantidadValidada: number;
  idUbicacion:      number;
  observaciones?:   string;
}

export interface DocumentoDTO {
  idDocumento:   number;
  nombreArchivo: string;
  rutaArchivo:   string;
  tipoDocumento: string;
  fechaSubida:   string;
  idLote:        number;
}

// ── Módulo 2: Dashboard del Supervisor ──────────────────────

export interface MiBodegaDTO {
  idAlmacen:      number;
  nombre:         string;
  direccion?:     string;
  ciudad?:        string;
  capacidadTotal: number;
  idEstado:       number;
}

export interface CategoriaDTO {
  idCategoria: number;
  nombre:      string;
  idEstado?:   number;
}

export interface ProductoDTO {
  idProducto:   number;
  nombre:       string;
  unidadMedida?: string;
  categoria?:   { idCategoria: number; nombre: string };
}

export interface ProveedorDTO {
  idProveedor: number;
  nombre:      string;
  ruc?:        string;
}

export interface CiudadDTO {
  idCiudad: number;
  nombre:   string;
}

export interface SupervisorOpcionDTO {
  idSupervisor:   number;
  nombreCompleto: string;
  correo?:        string;
}

export interface AlmacenCompletoDTO {
  idAlmacen:        number;
  nombre:           string;
  direccion?:       string;
  capacidadTotal:   number;
  idEstado:         number;
  ciudad?:          string;
  idCiudad?:        number;
  idSupervisor?:    number;
  nombreSupervisor?: string;
}

export interface AlmacenGuardarRequest {
  nombre:           string;
  direccion:        string;
  capacidadMaxima:  number;
  idCiudad:         number;
  idSupervisor?:    number | null;
  idEstado?:        number;
}

export interface LoteSupervisorRequest {
  numeroLote:       string;
  idProducto:       number;
  idProveedor:      number;
  idAlmacen:        number;
  fechaFabricacion: string;
  fechaVencimiento: string;
  cantidad:         number;
}

// ─── Servicio ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Almacenes
  getAlmacenes(): Observable<AlmacenDTO[]> {
    return this.http.get<AlmacenDTO[]>(`${this.apiUrl}/almacenes`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  // Cascada: Zonas por Almacén
  getZonas(idAlmacen: number): Observable<ZonaDTO[]> {
    return this.http.get<ZonaDTO[]>(`${this.apiUrl}/almacenes/${idAlmacen}/zonas`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  // Cascada: Estanterías por Zona
  getEstanterias(idZona: number): Observable<EstanteriaDTO[]> {
    return this.http.get<EstanteriaDTO[]>(`${this.apiUrl}/almacenes/zonas/${idZona}/estanterias`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  // Cascada: Ubicaciones por Estantería
  getUbicaciones(idEstanteria: number): Observable<UbicacionDTO[]> {
    return this.http.get<UbicacionDTO[]>(`${this.apiUrl}/almacenes/estanterias/${idEstanteria}/ubicaciones`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  // Lotes
  getLotes(): Observable<LoteDTO[]> {
    return this.http.get<LoteDTO[]>(`${this.apiUrl}/lotes`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getLotesFEFO(idProducto?: number): Observable<LoteDTO[]> {
    const params = idProducto ? `?idProducto=${idProducto}` : '';
    return this.http.get<LoteDTO[]>(`${this.apiUrl}/lotes/fefo${params}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getLotesPendientes(): Observable<LoteDTO[]> {
    return this.http.get<LoteDTO[]>(`${this.apiUrl}/lotes/pendientes`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getUbicacionesPorProducto(idProducto: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lotes/ubicaciones?idProducto=${idProducto}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  preRegistrarLote(data: LotePreRegistroRequest): Observable<LoteDTO> {
    return this.http.post<LoteDTO>(`${this.apiUrl}/lotes/pre-registro`, data);
  }

  validarLote(idLote: number, data: LoteValidacionRequest): Observable<LoteDTO> {
    return this.http.put<LoteDTO>(`${this.apiUrl}/lotes/${idLote}/validar`, data);
  }

  // Documentos
  subirDocumento(idLote: number, archivo: File, tipoDocumento: string): Observable<DocumentoDTO> {
    const form = new FormData();
    form.append('archivo', archivo);
    form.append('tipoDocumento', tipoDocumento);
    return this.http.post<DocumentoDTO>(`${this.apiUrl}/documentos-lote/${idLote}/upload`, form);
  }

  getDocumentos(idLote: number): Observable<DocumentoDTO[]> {
    return this.http.get<DocumentoDTO[]>(`${this.apiUrl}/documentos-lote/${idLote}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  eliminarDocumento(idDocumento: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documentos-lote/${idDocumento}`);
  }

  // ── Módulo 2: Topología, QR & Auditoría ───────────────────

  getArbolTopologia(): Observable<NodoTopologiaDTO[]> {
    return this.http.get<NodoTopologiaDTO[]>(`${this.apiUrl}/almacenes/arbol`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  crearZona(nombre: string, condicionClimatica: string, idAlmacen: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/almacenes/zonas`, { nombre, condicionClimatica, idAlmacen });
  }

  crearEstanteria(codigo: string, idZona: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/almacenes/estanterias`, { codigo, idZona });
  }

  crearUbicacion(nivel: string, posicion: string, capacidadMaxima: number, idEstanteria: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/almacenes/ubicaciones`, { nivel, posicion, capacidadMaxima, idEstanteria });
  }

  getQrUbicacionBase64(idUbicacion: number): Observable<{ qrBase64: string }> {
    return this.http.get<{ qrBase64: string }>(`${this.apiUrl}/almacenes/ubicaciones/${idUbicacion}/qr`);
  }

  getUbicacionPorQr(codigoQr: string): Observable<UbicacionDetalleQrDTO> {
    return this.http.get<UbicacionDetalleQrDTO>(`${this.apiUrl}/almacenes/ubicaciones/qr/${codigoQr}`);
  }

  // ── Módulo 2: Configuración global — Bodegas y Supervisores (Admin) ──

  getAlmacenesCompletos(): Observable<AlmacenCompletoDTO[]> {
    return this.http.get<AlmacenCompletoDTO[]>(`${this.apiUrl}/almacenes`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getCiudades(): Observable<CiudadDTO[]> {
    return this.http.get<CiudadDTO[]>(`${this.apiUrl}/almacenes/ciudades`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getSupervisoresDisponibles(): Observable<SupervisorOpcionDTO[]> {
    return this.http.get<SupervisorOpcionDTO[]>(`${this.apiUrl}/almacenes/supervisores`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  crearBodega(data: AlmacenGuardarRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/almacenes`, data);
  }

  actualizarBodega(idAlmacen: number, data: AlmacenGuardarRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/almacenes/${idAlmacen}`, data);
  }

  // ── Módulo 2: Dashboard del Supervisor ────────────────────

  getMisBodegas(): Observable<MiBodegaDTO[]> {
    return this.http.get<MiBodegaDTO[]>(`${this.apiUrl}/supervisor/mis-bodegas`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getMisLotes(idAlmacen: number, idCategoria?: number): Observable<LoteDTO[]> {
    const params = idCategoria ? `?idAlmacen=${idAlmacen}&idCategoria=${idCategoria}` : `?idAlmacen=${idAlmacen}`;
    return this.http.get<LoteDTO[]>(`${this.apiUrl}/supervisor/lotes${params}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  crearLoteSupervisor(data: LoteSupervisorRequest): Observable<LoteDTO> {
    return this.http.post<LoteDTO>(`${this.apiUrl}/supervisor/lotes`, data);
  }

  getCategorias(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(`${this.apiUrl}/supervisor/categorias`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getProductos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.apiUrl}/productos`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getProveedores(): Observable<ProveedorDTO[]> {
    return this.http.get<ProveedorDTO[]>(`${this.apiUrl}/proveedores`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  registrarConteoFisico(idUbicacion: number, conteoFisico: number, observaciones?: string): Observable<UbicacionDetalleQrDTO> {
    return this.http.post<UbicacionDetalleQrDTO>(`${this.apiUrl}/almacenes/ubicaciones/${idUbicacion}/conteo-fisico`, {
      conteoFisico,
      observaciones
    });
  }
}
