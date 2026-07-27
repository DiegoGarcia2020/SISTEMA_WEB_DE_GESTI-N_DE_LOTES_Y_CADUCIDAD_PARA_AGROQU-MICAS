import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Temporada {
  idTemporada?: number;
  nombre: string;
  fechaInicio: string;
  fechaFin?: string;
  estado?: string;
  fechaCreacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemporadaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/operaciones/temporadas`;

  aperturarTemporada(data: { nombre: string; fechaInicio: string }): Observable<Temporada> {
    return this.http.post<Temporada>(`${this.apiUrl}/aperturar`, data);
  }

  obtenerTemporadaActiva(): Observable<Temporada> {
    return this.http.get<Temporada>(`${this.apiUrl}/activa`);
  }

  listarTemporadas(): Observable<Temporada[]> {
    return this.http.get<Temporada[]>(this.apiUrl);
  }
}
