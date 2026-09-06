import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from './operaciones.service';
import { MiBodegaDTO, NodoTopologiaDTO } from './inventario.service';

export type { MiBodegaDTO, NodoTopologiaDTO };

@Injectable({
  providedIn: 'root'
})
export class BodegueroService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bodeguero`;

  /** Bodega asignada al bodeguero autenticado. null si todavía no tiene ninguna. */
  miBodega(): Observable<MiBodegaDTO | null> {
    return this.http.get<MiBodegaDTO>(`${this.apiUrl}/mi-bodega`, { observe: 'body' });
  }

  listarLotesDisponiblesFefo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/lotes-disponibles-fefo`);
  }

  listarAlertas(page: number = 0, size: number = 10): Observable<PageResponse<any>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/alertas`, { params });
  }

  listarDespachosPendientes(busqueda?: string): Observable<any[]> {
    const params: Record<string, string> = busqueda ? { busqueda } : {};
    return this.http.get<any[]>(`${this.apiUrl}/despachos/pendientes`, { params });
  }

  listarDespachosPendientesEntrega(busqueda?: string): Observable<any[]> {
    const params: Record<string, string> = busqueda ? { busqueda } : {};
    return this.http.get<any[]>(`${this.apiUrl}/despachos/pendientes-entrega`, { params });
  }

  getArbolTopologia(): Observable<NodoTopologiaDTO[]> {
    return this.http.get<NodoTopologiaDTO[]>(`${this.apiUrl}/topologia`);
  }

  listarLotesPendientes(idEstadoPendiente?: number): Observable<any[]> {
    const params: Record<string, string> = idEstadoPendiente != null ? { idEstadoPendiente: String(idEstadoPendiente) } : {};
    return this.http.get<any[]>(`${this.apiUrl}/lotes-pendientes`, { params });
  }
}
