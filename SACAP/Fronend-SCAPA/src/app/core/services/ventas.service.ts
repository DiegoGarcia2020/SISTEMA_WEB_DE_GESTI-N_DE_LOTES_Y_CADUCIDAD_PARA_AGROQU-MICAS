import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ClienteDTO, ClienteCreateRequest, SugerenciaComboDTO,
  VentaCreateRequest, VentaDTO, VentaDashboardDTO, CultivoDTO, PlagaDTO, ProductoCatalogo
} from '../models/ventas.model';

export interface CategoriaDTO {
  idCategoria: number;
  nombre: string;
  idEstado?: number;
}

@Injectable({ providedIn: 'root' })
export class VentasService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ── Dashboard ────────────────────────────────────────────
  getDashboard(): Observable<VentaDashboardDTO> {
    return this.http.get<VentaDashboardDTO>(`${this.apiUrl}/ventas/dashboard`);
  }

  // ── Catálogo General ─────────────────────────────────────
  getLotesDisponibles(busqueda?: string): Observable<any[]> {
    const params = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/lotes/disponibles${params}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getCatalogo(q?: string, limit: number = 24): Observable<ProductoCatalogo[]> {
    let url = `${this.apiUrl}/ventas/catalogo?limit=${limit}`;
    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }
    return this.http.get<ProductoCatalogo[]>(url).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  // ── Categorías / Motor de Sugerencias ─────────────────────
  getCategorias(): Observable<CategoriaDTO[]> {
    return this.http.get<CategoriaDTO[]>(`${this.apiUrl}/ventas/categorias`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getSugerencias(idCategoria: number): Observable<SugerenciaComboDTO[]> {
    return this.http.get<SugerenciaComboDTO[]>(`${this.apiUrl}/ventas/sugerencias?idCategoria=${idCategoria}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  // ── Diagnóstico (cultivo + plaga) ──────────────────────────
  getCultivos(): Observable<CultivoDTO[]> {
    return this.http.get<CultivoDTO[]>(`${this.apiUrl}/ventas/cultivos`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getPlagas(): Observable<PlagaDTO[]> {
    return this.http.get<PlagaDTO[]>(`${this.apiUrl}/ventas/plagas`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  getSugerenciasPorPlaga(idPlaga: number, idCultivo?: number | null): Observable<SugerenciaComboDTO[]> {
    const cultivoQs = idCultivo ? `&idCultivo=${idCultivo}` : '';
    return this.http.get<SugerenciaComboDTO[]>(`${this.apiUrl}/ventas/sugerencias-plaga?idPlaga=${idPlaga}${cultivoQs}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  // ── Clientes ───────────────────────────────────────────────
  buscarClientes(texto: string): Observable<ClienteDTO[]> {
    const q = texto ? `?buscar=${encodeURIComponent(texto)}` : '';
    return this.http.get<ClienteDTO[]>(`${this.apiUrl}/clientes${q}`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  crearCliente(data: ClienteCreateRequest): Observable<ClienteDTO> {
    return this.http.post<ClienteDTO>(`${this.apiUrl}/clientes`, data);
  }

  // ── Checkout ───────────────────────────────────────────────
  crearVenta(data: VentaCreateRequest): Observable<VentaDTO> {
    return this.http.post<VentaDTO>(`${this.apiUrl}/ventas`, data);
  }

  misVentas(): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(`${this.apiUrl}/ventas`).pipe(
      catchError(e => e.status === 0 || e.status === 404 ? of([]) : throwError(() => e))
    );
  }

  obtenerVenta(idVenta: number): Observable<VentaDTO> {
    return this.http.get<VentaDTO>(`${this.apiUrl}/ventas/${idVenta}`);
  }
}
