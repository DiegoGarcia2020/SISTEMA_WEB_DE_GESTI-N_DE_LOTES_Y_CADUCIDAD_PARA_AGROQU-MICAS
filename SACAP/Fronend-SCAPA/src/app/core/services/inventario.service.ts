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
}

export interface UbicacionDTO {
  idUbicacion:         number;
  nivel:               string;
  posicion:            string;
  descripcionCompleta: string;
  codigoEstanteria:    string;
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
      catchError(e => e.status === 0 || e.status === 404 ? of(MOCK_ALMACENES) : throwError(() => e))
    );
  }

  // Cascada: Zonas por Almacén
  getZonas(idAlmacen: number): Observable<ZonaDTO[]> {
    return this.http.get<ZonaDTO[]>(`${this.apiUrl}/almacenes/${idAlmacen}/zonas`).pipe(
      catchError(e => e.status === 0 || e.status === 404
        ? of(MOCK_ZONAS.filter(z => z.idAlmacen === idAlmacen))
        : throwError(() => e))
    );
  }

  // Cascada: Estanterías por Zona
  getEstanterias(idZona: number): Observable<EstanteriaDTO[]> {
    return this.http.get<EstanteriaDTO[]>(`${this.apiUrl}/almacenes/zonas/${idZona}/estanterias`).pipe(
      catchError(e => e.status === 0 || e.status === 404
        ? of(MOCK_ESTANTERIAS.filter(est => est.idZona === idZona))
        : throwError(() => e))
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
}
