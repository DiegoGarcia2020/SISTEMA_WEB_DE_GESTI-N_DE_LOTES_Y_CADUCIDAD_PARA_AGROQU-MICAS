import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReporteFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  idProducto?: number;
  idCliente?: number;
  idCategoria?: number;
  idTemporada?: number;
}

export interface ReporteRespuesta {
  titulo: string;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  getReporte(ruta: string, filtros?: ReporteFiltros): Observable<ReporteRespuesta> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
      if (filtros.idProducto) params = params.set('idProducto', filtros.idProducto.toString());
      if (filtros.idCliente) params = params.set('idCliente', filtros.idCliente.toString());
    }
    return this.http.get<ReporteRespuesta>(`${this.apiUrl}/${ruta}`, { params });
  }
}
