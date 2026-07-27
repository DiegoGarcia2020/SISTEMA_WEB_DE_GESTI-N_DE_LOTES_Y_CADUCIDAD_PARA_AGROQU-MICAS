import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

// ─── Mocks (fallback offline) ─────────────────────────────
const MOCK_ALMACENES: AlmacenDTO[] = [
  { idAlmacen: 1, nombre: 'Bodega Central Quevedo', capacidadTotal: 5000, ciudad: 'Quevedo', idEstado: 1 },
  { idAlmacen: 2, nombre: 'Almacén Agroquímicos Norte', capacidadTotal: 2500, ciudad: 'Babahoyo', idEstado: 1 }
];

const MOCK_ZONAS: ZonaDTO[] = [
  { idZona: 1, nombre: 'Zona A — Líquidos', condicionClimatica: 'Temperatura controlada 18°C', idAlmacen: 1 },
  { idZona: 2, nombre: 'Zona B — Sólidos / Granos', condicionClimatica: 'Ambiente seco < 65% HR', idAlmacen: 1 },
  { idZona: 3, nombre: 'Zona Norte — Fertilizantes', condicionClimatica: 'Ventilado natural', idAlmacen: 2 }
];

const MOCK_ESTANTERIAS: EstanteriaDTO[] = [
  { idEstanteria: 1, codigo: 'EST-A1', idZona: 1 },
  { idEstanteria: 2, codigo: 'EST-A2', idZona: 1 },
  { idEstanteria: 3, codigo: 'EST-B1', idZona: 2 },
  { idEstanteria: 4, codigo: 'EST-N1', idZona: 3 }
];

const MOCK_UBICACIONES: UbicacionDTO[] = [
  { idUbicacion: 1, nivel: '1', posicion: 'A', descripcionCompleta: 'EST-A1 / Nivel 1 / Pos. A', codigoEstanteria: 'EST-A1' },
  { idUbicacion: 2, nivel: '1', posicion: 'B', descripcionCompleta: 'EST-A1 / Nivel 1 / Pos. B', codigoEstanteria: 'EST-A1' },
  { idUbicacion: 3, nivel: '2', posicion: 'A', descripcionCompleta: 'EST-A1 / Nivel 2 / Pos. A', codigoEstanteria: 'EST-A1' },
  { idUbicacion: 4, nivel: '1', posicion: 'A', descripcionCompleta: 'EST-A2 / Nivel 1 / Pos. A', codigoEstanteria: 'EST-A2' }
];

// ─── Servicio ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Almacenes
  getAlmacenes(): Observable<AlmacenDTO[]> {
    return this.http.get<AlmacenDTO[]>(`${this.apiUrl}/almacenes`).pipe(
      map(lista => lista?.length ? lista : MOCK_ALMACENES),
      catchError(() => of(MOCK_ALMACENES))
    );
  }

  // Cascada: Zonas por Almacén
  getZonas(idAlmacen: number): Observable<ZonaDTO[]> {
    return this.http.get<ZonaDTO[]>(`${this.apiUrl}/almacenes/${idAlmacen}/zonas`).pipe(
      map(lista => lista?.length ? lista : MOCK_ZONAS.filter(z => z.idAlmacen === idAlmacen)),
      catchError(() => of(MOCK_ZONAS.filter(z => z.idAlmacen === idAlmacen)))
    );
  }

  // Cascada: Estanterías por Zona
  getEstanterias(idZona: number): Observable<EstanteriaDTO[]> {
    return this.http.get<EstanteriaDTO[]>(`${this.apiUrl}/almacenes/zonas/${idZona}/estanterias`).pipe(
      map(lista => lista?.length ? lista : MOCK_ESTANTERIAS.filter(est => est.idZona === idZona)),
      catchError(() => of(MOCK_ESTANTERIAS.filter(est => est.idZona === idZona)))
    );
  }

  // Cascada: Ubicaciones por Estantería
  getUbicaciones(idEstanteria: number): Observable<UbicacionDTO[]> {
    return this.http.get<UbicacionDTO[]>(`${this.apiUrl}/almacenes/estanterias/${idEstanteria}/ubicaciones`).pipe(
      catchError(e => e.status === 0 || e.status === 404
        ? of(MOCK_UBICACIONES.filter(u => u.codigoEstanteria === MOCK_ESTANTERIAS.find(es => es.idEstanteria === idEstanteria)?.codigo))
        : throwError(() => e))
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

  preRegistrarLote(data: LotePreRegistroRequest): Observable<LoteDTO> {
    return this.http.post<LoteDTO>(`${this.apiUrl}/lotes/pre-registro`, data).pipe(
      catchError(e => {
        if (e.status === 0 || e.status === 404 || e.status === 401 || e.status === 403) {
          console.warn('⚠️ Usando mock local para preRegistrarLote.');
          const mockLote: LoteDTO = {
            idLote: Math.floor(Math.random() * 1000) + 100,
            numeroLote: data.numeroLote,
            fechaFabricacion: data.fechaFabricacion,
            fechaVencimiento: data.fechaVencimiento,
            cantidadInicial: data.cantidadDeclarada,
            cantidadActual: data.cantidadDeclarada,
            fechaIngreso: new Date().toISOString(),
            idEstadoLote: 1, // EN REVISION
            idProducto: data.idProducto,
            nombreProducto: 'Producto Demo',
            idProveedor: data.idProveedor,
            nombreProveedor: 'Proveedor Demo',
            idUbicacion: 0,
            descripcionUbicacion: 'Pendiente de asignación',
            diasHastaVencimiento: 300
          };
          return of(mockLote);
        }
        return throwError(() => e);
      })
    );
  }

  validarLote(idLote: number, data: LoteValidacionRequest): Observable<LoteDTO> {
    return this.http.put<LoteDTO>(`${this.apiUrl}/lotes/${idLote}/validar`, data).pipe(
      catchError(e => {
        if (e.status === 0 || e.status === 404 || e.status === 401 || e.status === 403) {
          console.warn('⚠️ Usando mock local para validarLote.');
          const mockLote: LoteDTO = {
            idLote: idLote,
            numeroLote: 'LOTE-VALIDADO-MOCK',
            fechaFabricacion: '2025-01-01',
            fechaVencimiento: '2026-01-01',
            cantidadInicial: data.cantidadValidada,
            cantidadActual: data.cantidadValidada,
            fechaIngreso: new Date().toISOString(),
            idEstadoLote: 2, // ACTIVO
            idProducto: 1,
            nombreProducto: 'Producto Demo',
            idProveedor: 1,
            nombreProveedor: 'Proveedor Demo',
            idUbicacion: data.idUbicacion,
            descripcionUbicacion: 'Ubicación Validada',
            diasHastaVencimiento: 300
          };
          return of(mockLote);
        }
        return throwError(() => e);
      })
    );
  }

  // Documentos
  subirDocumento(idLote: number, archivo: File, tipoDocumento: string): Observable<DocumentoDTO> {
    const form = new FormData();
    form.append('archivo', archivo);
    form.append('tipoDocumento', tipoDocumento);
    return this.http.post<DocumentoDTO>(`${this.apiUrl}/documentos-lote/${idLote}/upload`, form).pipe(
      catchError(e => {
        if (e.status === 0 || e.status === 404 || e.status === 401 || e.status === 403) {
          console.warn('⚠️ Usando mock local para subirDocumento.');
          const docMock: DocumentoDTO = {
            idDocumento: Math.floor(Math.random() * 1000) + 1,
            nombreArchivo: archivo.name,
            rutaArchivo: 'https://mock-url.com/' + archivo.name,
            tipoDocumento: tipoDocumento,
            fechaSubida: new Date().toISOString(),
            idLote: idLote
          };
          return of(docMock);
        }
        return throwError(() => e);
      })
    );
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
      catchError(() => of([]))
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
    return this.http.get<{ qrBase64: string }>(`${this.apiUrl}/almacenes/ubicaciones/${idUbicacion}/qr`).pipe(
      catchError(() => of({ qrBase64: '' }))
    );
  }

  getUbicacionPorQr(codigoQr: string): Observable<UbicacionDetalleQrDTO> {
    return this.http.get<UbicacionDetalleQrDTO>(`${this.apiUrl}/almacenes/ubicaciones/qr/${codigoQr}`).pipe(
      catchError(e => {
        console.warn('⚠️ Usando mock local para getUbicacionPorQr.');
        const qrClean = codigoQr && codigoQr.length > 2 ? codigoQr : 'UBIC-EST1-N1-PA';
        const mock: UbicacionDetalleQrDTO = {
          idUbicacion: 1,
          codigoQr: qrClean,
          descripcionCompleta: 'EST-A1 / Nivel 1 / Posición A',
          nombreAlmacen: 'Centro de Distribución Guayas',
          nombreZona: 'Zona A - Secos',
          codigoEstanteria: 'EST-A1',
          nivel: '1',
          posicion: 'A',
          capacidadMaxima: 1000,
          capacidadActual: 500,
          capacidadDisponible: 500,
          porcentajeOcupacion: 50,
          lotesAlmacenados: [
            { idLote: 1, numeroLote: 'LT-001', fechaFabricacion: '2024-01-01', fechaVencimiento: '2026-06-30', cantidadInicial: 500, cantidadActual: 500, fechaIngreso: '2024-01-10', idEstadoLote: 1, idProducto: 1, nombreProducto: 'Urea Granulada 46%', idProveedor: 1, nombreProveedor: 'AgroInsumos S.A.', idUbicacion: 1, descripcionUbicacion: 'EST-A1 / Nivel 1 / Posición A', diasHastaVencimiento: 700 }
          ]
        };
        return of(mock);
      })
    );
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
    }).pipe(
      catchError(e => {
        console.warn('⚠️ Usando mock local para registrarConteoFisico.');
        const mock: UbicacionDetalleQrDTO = {
          idUbicacion: idUbicacion,
          codigoQr: 'UBIC-EST1-N1-PA',
          descripcionCompleta: 'EST-A1 / Nivel 1 / Posición A',
          nombreAlmacen: 'Centro de Distribución Guayas',
          nombreZona: 'Zona A - Secos',
          codigoEstanteria: 'EST-A1',
          nivel: '1',
          posicion: 'A',
          capacidadMaxima: 1000,
          capacidadActual: conteoFisico,
          capacidadDisponible: Math.max(0, 1000 - conteoFisico),
          porcentajeOcupacion: Math.min(100, Math.round((conteoFisico / 1000) * 100)),
          lotesAlmacenados: []
        };
        return of(mock);
      })
    );
  }
}
