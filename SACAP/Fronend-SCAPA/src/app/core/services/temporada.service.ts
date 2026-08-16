import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Temporada {
  idTemporada?: number;
  nombre: string;
  idCultivo?: number;
  nombreCultivo?: string;
  fechaInicio: string;
  fechaFinProyectada?: string;
  estado?: string;
  progresoPorcentaje?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TemporadaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/temporadas`;

  crearTemporada(data: { nombre: string; idCultivo?: number; fechaInicio: string; fechaFinProyectada: string; estado?: string }): Observable<Temporada> {
    return this.http.post<Temporada>(this.apiUrl, data);
  }

  listarTemporadas(): Observable<Temporada[]> {
    return this.http.get<Temporada[]>(this.apiUrl);
  }

  cambiarEstado(idTemporada: number, estado: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${idTemporada}/estado`, { estado });
  }
}
